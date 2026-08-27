/**
 * check if the value has the Date type
if yes --> treat is as a Date object
if no --> just plain String
 */

module.exports = (oldValue, newValue) => {
    if (oldValue instanceof Date) {
        return oldValue.getTime() === new Date(newValue).getTime();
    }
    return String(oldValue) === String(newValue);
}