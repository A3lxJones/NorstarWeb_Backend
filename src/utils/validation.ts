/**
 * Basic validation helpers.
 * Keeps route handlers clean by centralising input checks.
 */

export function isValidUUID(value: string | string[]): boolean {
    if (Array.isArray(value)) return false;
    const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(value);
}

export function isValidDate(value: string): boolean {
    const date = new Date(value);
    return !isNaN(date.getTime());
}

export function isValidEmail(value: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
}

export function isNonEmptyString(value: unknown): value is string {
    return typeof value === "string" && value.trim().length > 0;
}

/**
 * Returns an array of missing required fields from the body.
 * Usage: const missing = getMissingFields(req.body, ["first_name", "last_name"]);
 */
export function getMissingFields(
    body: Record<string, unknown>,
    requiredFields: string[]
): string[] {
    return requiredFields.filter(
        (field) => body[field] === undefined || body[field] === null || body[field] === ""
    );
}
