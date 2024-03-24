/**
 * @description - a function that applies class names based on passed classObject prop
 * @param {*} classObject - object of applied class
 * @returns {string} - a string which has applicable classnames seperated by space
 * @author Krishna Saini
 */
export const getClassnames = (classObject) => {
	let appliedClasses = '';
	for (const [key] of Object.entries(classObject)) {
		if (classObject[key]) {
			appliedClasses = `${appliedClasses} ${key}`;
		}
	}
	return appliedClasses;
};
