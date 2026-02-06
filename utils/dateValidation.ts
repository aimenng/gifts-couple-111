/**
 * Date validation utilities
 */

// Validate date format (YYYY-MM-DD)
export const isValidDateFormat = (dateStr: string): boolean => {
    if (!dateStr) return false;

    // Check format YYYY-MM-DD
    const dateRegex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
    if (!dateRegex.test(dateStr)) return false;

    // Parse and validate the actual date
    const [year, month, day] = dateStr.split('-').map(Number);

    // Year should be 4 digits (1900-2100 is reasonable range)
    if (year < 1900 || year > 2100) return false;

    // Check if the date is actually valid (handles Feb 30, etc.)
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day;
};

// Format date string to ensure proper format
export const formatDateForInput = (dateStr: string): string => {
    if (!dateStr) return '';

    // If already in correct format, return as is
    if (isValidDateFormat(dateStr)) return dateStr;

    // Try to parse and format
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

// Get validation error message for date
export const getDateValidationError = (dateStr: string): string | null => {
    if (!dateStr) return '请输入日期';

    // Check basic format
    const parts = dateStr.split('-');
    if (parts.length !== 3) return '日期格式应为 YYYY-MM-DD';

    const [yearStr, monthStr, dayStr] = parts;

    // Year validation
    if (yearStr.length !== 4) return '年份必须是4位数';
    const year = parseInt(yearStr, 10);
    if (isNaN(year)) return '年份无效';
    if (year < 1900) return '年份不能早于1900年';
    if (year > 2100) return '年份不能晚于2100年';

    // Month validation
    const month = parseInt(monthStr, 10);
    if (isNaN(month) || month < 1 || month > 12) return '月份应在1-12之间';

    // Day validation
    const day = parseInt(dayStr, 10);
    if (isNaN(day) || day < 1 || day > 31) return '日期应在1-31之间';

    // Check if date is actually valid
    const date = new Date(year, month - 1, day);
    if (date.getFullYear() !== year ||
        date.getMonth() !== month - 1 ||
        date.getDate() !== day) {
        return '该日期不存在';
    }

    return null;
};

// Get min date for date input (1900-01-01)
export const getMinDate = (): string => '1900-01-01';

// Get max date for date input (2100-12-31)
export const getMaxDate = (): string => '2100-12-31';
