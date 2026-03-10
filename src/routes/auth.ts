import { Router, Request, Response } from 'express';
import { supabaseAdmin, createAnonClient } from '../config/supabase';
import { isValidEmail, isNonEmptyString } from '../utils/validation';
import { ApiResponse, UserRole } from '../types';

const router = Router();

/**
 * POST /api/auth/signup
 * Register a new user (parent by default).
 * Body: { email, password, full_name, phone?, role? }
 */
router.post('/signup', async (req: Request, res: Response): Promise<void> => {
	const { email, password, full_name, phone, role } = req.body;

	if (!isValidEmail(email) || !isNonEmptyString(password) || !isNonEmptyString(full_name)) {
		res.status(400).json({
			success: false,
			error: 'email, password, and full_name are required'
		} as ApiResponse);
		return;
	}

	if (password.length < 8) {
		res.status(400).json({
			success: false,
			error: 'Password must be at least 8 characters'
		} as ApiResponse);
		return;
	}

	const userRole: UserRole = role === 'coach' || role === 'admin' ? role : 'parent';

	// Only admins can create other admin accounts
	// For initial setup, the first admin must be set directly in Supabase dashboard
	if (userRole === 'admin') {
		res.status(403).json({
			success: false,
			error: 'Admin accounts can only be created by existing admins'
		} as ApiResponse);
		return;
	}

	const { data, error } = await supabaseAdmin.auth.admin.createUser({
		email,
		password,
		email_confirm: true,
		user_metadata: { full_name, phone: phone || null, role: userRole }
	});

	if (error) {
		res.status(400).json({ success: false, error: error.message } as ApiResponse);
		return;
	}

	// Create profile row (the DB trigger also does this, but belt-and-braces)
	if (data.user) {
		await supabaseAdmin.from('profiles').upsert({
			id: data.user.id,
			email,
			full_name,
			phone: phone || null,
			role: userRole
		});
	}

	res.status(201).json({
		success: true,
		message: 'Account created successfully.',
		data: { userId: data.user?.id }
	} as ApiResponse);
});

/**
 * POST /api/auth/login
 * Sign in with email + password. Returns access & refresh tokens.
 * Body: { email, password }
 */
router.post('/login', async (req: Request, res: Response): Promise<void> => {
	const { email, password } = req.body;

	if (!isValidEmail(email) || !isNonEmptyString(password)) {
		res.status(400).json({
			success: false,
			error: 'email and password are required'
		} as ApiResponse);
		return;
	}

	const anonClient = createAnonClient();
	const { data, error } = await anonClient.auth.signInWithPassword({
		email,
		password
	});

	if (error) {
		res.status(401).json({ success: false, error: 'Invalid email or password' } as ApiResponse);
		return;
	}

	res.json({
		success: true,
		data: {
			accessToken: data.session?.access_token,
			refreshToken: data.session?.refresh_token,
			user: {
				id: data.user?.id,
				email: data.user?.email,
				role: data.user?.user_metadata?.role
			}
		}
	} as ApiResponse);
});

/**
 * POST /api/auth/logout
 * Sign out the current session.
 */
router.post('/logout', async (req: Request, res: Response): Promise<void> => {
	const authHeader = req.headers.authorization;
	const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

	if (!token) {
		res.status(401).json({ success: false, error: 'Missing authorization header' } as ApiResponse);
		return;
	}

	// Use the admin API to get the user from the token, then sign them out
	const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

	if (userError || !user) {
		res.status(401).json({ success: false, error: 'Invalid token' } as ApiResponse);
		return;
	}

	const { error } = await supabaseAdmin.auth.admin.signOut(token);

	if (error) {
		res.status(500).json({ success: false, error: error.message } as ApiResponse);
		return;
	}

	res.json({ success: true, message: 'Logged out successfully' } as ApiResponse);
});

/**
 * POST /api/auth/refresh
 * Refresh an expired access token.
 * Body: { refresh_token }
 */
router.post('/refresh', async (req: Request, res: Response): Promise<void> => {
	const { refresh_token } = req.body;

	if (!isNonEmptyString(refresh_token)) {
		res.status(400).json({
			success: false,
			error: 'refresh_token is required'
		} as ApiResponse);
		return;
	}

	const anonClient = createAnonClient();
	const { data, error } = await anonClient.auth.refreshSession({
		refresh_token
	});

	if (error) {
		res.status(401).json({ success: false, error: 'Invalid refresh token' } as ApiResponse);
		return;
	}

	res.json({
		success: true,
		data: {
			accessToken: data.session?.access_token,
			refreshToken: data.session?.refresh_token
		}
	} as ApiResponse);
});

/**
 * GET /api/auth/me
 * Return the authenticated user's profile.
 * The frontend uses this to decide which view to render (parent vs coach vs admin).
 */
router.get("/me", authenticate, async (req: Request, res: Response): Promise<void> => {
    const { data: profile, error } = await supabaseAdmin
        .from("profiles")
        .select("*")
        .eq("id", req.userId!)
        .single();

    if (error || !profile) {
        res.status(404).json({ success: false, error: "Profile not found" } as ApiResponse);
        return;
    }

    res.json({
        success: true,
        data: {
            ...profile,
            // If an admin is impersonating, tell the frontend both the real and effective role
            effectiveRole: req.userRole,
            isImpersonating: profile.role !== req.userRole,
        },
    } as ApiResponse);
});

export default router;
