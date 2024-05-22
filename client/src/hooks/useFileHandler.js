import {useState} from 'react';

const useFileHandler = (validFormats) => {
	const [file, setFile] = useState(null);
	const [error, setError] = useState(null);

	const handleFile = (file) => {
		setError(null);
		const fileType = file.name.split('.').slice(-1)[0];

		if (validFormats && !validFormats.includes(fileType)) {
			setError(
				`Please select ${validFormats.toString()} file. You chose a ${fileType} file.`,
			);
			return;
		}

		try {
			const url = URL.createObjectURL(file);
			setFile({name: file.name, url, data: file});
		} catch (error) {
			setError('An error occurred while reading the file.');
		}
	};

	return {file, setFile, error, handleFile};
};

export default useFileHandler;
