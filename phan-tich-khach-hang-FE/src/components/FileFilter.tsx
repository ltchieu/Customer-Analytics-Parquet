import React, { useEffect, useState } from 'react';
import { getFiles } from '../services/api';

interface FileFilterProps {
    selectedFile: string | undefined;
    onFileSelect: (fileName: string | undefined) => void;
}

export const FileFilter: React.FC<FileFilterProps> = ({ selectedFile, onFileSelect }) => {
    const [files, setFiles] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFiles = async () => {
            try {
                const fileList = await getFiles();
                setFiles(fileList);
            } catch (error) {
                console.error('Error fetching files:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchFiles();
    }, []);

    if (loading) {
        return <div className="text-sm text-gray-500">Đang tải danh sách file...</div>;
    }

    if (files.length === 0) {
        return null;
    }

    return (
        <div className="flex items-center gap-2">
            <label htmlFor="file-filter" className="text-sm font-medium text-gray-700">
                File dữ liệu:
            </label>
            <select
                id="file-filter"
                value={selectedFile || ''}
                onChange={(e) => onFileSelect(e.target.value || undefined)}
                className="block w-48 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
            >
                <option value="">Tất cả</option>
                {files.map((file) => (
                    <option key={file} value={file}>
                        {file}
                    </option>
                ))}
            </select>
        </div>
    );
};
