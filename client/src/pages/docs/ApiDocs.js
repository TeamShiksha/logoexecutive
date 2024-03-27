import {useEffect, useState} from 'react';
import ReactMarkdown from 'react-markdown';
import gfm from 'remark-gfm';
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
	const [post, setPost] = useState('');
	useEffect(() => {
		const fetchMarkdown = async () => {
			try {
				const res = await import(`../../assets/markdown/${file_name}`);
				const response = await fetch(res.default);
				const text = await response.text();
				setPost(text);
			} catch (err) {
				console.log(err);
			}
		};
		fetchMarkdown();
	}, []);

	return (
		<section className='markdown-body'>
			<ReactMarkdown components={components} remarkPlugins={[gfm]}>
				{post}
			</ReactMarkdown>
		</section>
	);
};

export default ApiDocs;
