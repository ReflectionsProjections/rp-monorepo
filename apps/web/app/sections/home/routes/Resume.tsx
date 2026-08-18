import React from 'react';
import { api } from '@app';

const Resume: React.FC = () => {
    React.useEffect(() => {
        api.get('/s3/download')
            .then((response) => {
                window.location.href = response.data.url;
            })
            .catch(() => {
                window.location.href = '/';
            });
    }, []);

    return <p>Loading...</p>;
};

export default Resume;
