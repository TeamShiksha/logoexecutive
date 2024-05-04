import {useEffect, useState} from 'react';
import ReactMarkdown from 'react-markdown';
import gfm from 'remark-gfm';
import Spinner from '../../components/spinner/Spinner';
import './ApiDocs.css';

const components = {
	code({className, children, ...props}) {
		return (
			<code className={className} {...props}>
				{children}
			</code>
		);
	},
};

function ApiDocs() {
	const file_name = 'docs.md';
	const [isLoading, setIsLoading] = useState(false);
	const [showErrMssg, setShowErrMssg] = useState('');
	const [post, setPost] = useState('');
	useEffect(() => {
		const fetchMarkdown = async () => {
			setIsLoading(true);
			try {
				const res = await import(`../../../../docs/${file_name}`);
				const response = await fetch(res.default);
				const text = await response.text();
				setPost(text);
			} catch (err) {
				setShowErrMssg('File Not Found!');
			}
			setIsLoading(false);
		};
		fetchMarkdown();
	}, []);

	return (
		<>
			<section className='markdown-body'>
				{post ? (
					<ReactMarkdown components={components} remarkPlugins={[gfm]}>
						{post}
					</ReactMarkdown>
				) : (
					<div className='errorMessage'>{showErrMssg}</div>
				)}
			</section>
			{isLoading && <Spinner />}
		</>
	);
}

export default ApiDocs;
