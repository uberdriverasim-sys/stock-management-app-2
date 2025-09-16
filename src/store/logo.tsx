import React, { createContext, useContext, useEffect, useState } from 'react';

type LogoContextValue = {
	logoUrl: string | null;
	uploadLogo: (file: File) => Promise<{ success: boolean; message: string }>;
	removeLogo: () => void;
	isUploading: boolean;
};

const LOGO_KEY = 'company-logo:v1';

const LogoContext = createContext<LogoContextValue | null>(null);

export const LogoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [logoUrl, setLogoUrl] = useState<string | null>(null);
	const [isUploading, setIsUploading] = useState(false);

	// Load logo from localStorage on mount
	useEffect(() => {
		try {
			const savedLogo = localStorage.getItem(LOGO_KEY);
			if (savedLogo) {
				setLogoUrl(savedLogo);
			}
		} catch {
			// Ignore errors
		}
	}, []);

	// Save logo to localStorage when it changes
	useEffect(() => {
		try {
			if (logoUrl) {
				localStorage.setItem(LOGO_KEY, logoUrl);
			} else {
				localStorage.removeItem(LOGO_KEY);
			}
		} catch {
			// Ignore errors
		}
	}, [logoUrl]);

	const uploadLogo = async (file: File): Promise<{ success: boolean; message: string }> => {
		setIsUploading(true);

		try {
			// Validate file type
			if (!file.type.startsWith('image/')) {
				return { success: false, message: 'Please select an image file' };
			}

			// Validate file size (max 2MB)
			if (file.size > 2 * 1024 * 1024) {
				return { success: false, message: 'Image size must be less than 2MB' };
			}

			// Convert to base64 for storage
			return new Promise((resolve) => {
				const reader = new FileReader();
				reader.onload = (e) => {
					const result = e.target?.result as string;
					setLogoUrl(result);
					resolve({ success: true, message: 'Logo uploaded successfully!' });
				};
				reader.onerror = () => {
					resolve({ success: false, message: 'Failed to read image file' });
				};
				reader.readAsDataURL(file);
			});
		} catch (error) {
			return { success: false, message: 'An error occurred while uploading' };
		} finally {
			setIsUploading(false);
		}
	};

	const removeLogo = () => {
		setLogoUrl(null);
	};

	const value: LogoContextValue = {
		logoUrl,
		uploadLogo,
		removeLogo,
		isUploading,
	};

	return <LogoContext.Provider value={value}>{children}</LogoContext.Provider>;
};

export const useLogo = () => {
	const ctx = useContext(LogoContext);
	if (!ctx) throw new Error('useLogo must be used within LogoProvider');
	return ctx;
};

