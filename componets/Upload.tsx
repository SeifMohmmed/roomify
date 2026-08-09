import { useEffect, useRef, useState } from "react";
import { useOutletContext } from "react-router";
import {
    UploadIcon,
    CheckCircle2,
    ImageIcon,
} from "lucide-react";
import {
    PROGRESS_INTERVAL_MS,
    PROGRESS_STEP,
    REDIRECT_DELAY_MS,
} from "../lib/constants";

interface UploadProps {
    onComplete: (base64: string) => void;
}

const ACCEPTED_FILE_TYPES = ["image/jpeg", "image/png"];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB — matches home.tsx's "up to 10MB" copy

const Upload = ({ onComplete }: UploadProps) => {
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const { isSignedIn } = useOutletContext<{
        isSignedIn: boolean;
    }>();

    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const base64Ref = useRef<string | null>(null);

    const clearTimers = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
    };

    // Clear timers on unmount
    useEffect(() => {
        return () => clearTimers();
    }, []);

    // React to progress completion: stop the interval and schedule onComplete once
    useEffect(() => {
        if (progress !== 100) return;

        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }

        timeoutRef.current = setTimeout(() => {
            if (base64Ref.current) {
                onComplete(base64Ref.current);
            }
        }, REDIRECT_DELAY_MS);

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
        };
    }, [progress, onComplete]);

    const processFile = (selectedFile: File) => {
        if (!isSignedIn) return;

        if (!ACCEPTED_FILE_TYPES.includes(selectedFile.type)) {
            setError("Unsupported file type. Please upload a JPG or PNG image.");
            return;
        }
//asd
        if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
            setError("File is too large. Maximum file size is 10 MB.");
            return;
        }

        // Reset any in-flight upload before starting a new one
        clearTimers();
        base64Ref.current = null;
        setError(null);
        setFile(selectedFile);
        setProgress(0);

        const reader = new FileReader();

        reader.onload = () => {
            base64Ref.current = reader.result as string;

            intervalRef.current = setInterval(() => {
                setProgress((prev) => Math.min(prev + PROGRESS_STEP, 100));
            }, PROGRESS_INTERVAL_MS);
        };

        reader.onerror = () => {
            setError("Something went wrong reading the file. Please try again.");
            setFile(null);
            setProgress(0);
        };

        reader.onabort = () => {
            setError("File reading was cancelled. Please try again.");
            setFile(null);
            setProgress(0);
        };

        reader.readAsDataURL(selectedFile);
    };

    const handleFileChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        if (!isSignedIn) return;

        const selectedFile = event.target.files?.[0];

        if (selectedFile) {
            processFile(selectedFile);
        }
    };

    const handleDragOver = (
        event: React.DragEvent<HTMLDivElement>
    ) => {
        event.preventDefault();

        if (!isSignedIn) return;

        setIsDragging(true);
    };

    const handleDragLeave = (
        event: React.DragEvent<HTMLDivElement>
    ) => {
        event.preventDefault();

        if (!isSignedIn) return;

        setIsDragging(false);
    };

    const handleDrop = (
        event: React.DragEvent<HTMLDivElement>
    ) => {
        event.preventDefault();

        if (!isSignedIn) return;

        setIsDragging(false);

        const droppedFile = event.dataTransfer.files?.[0];

        if (droppedFile) {
            processFile(droppedFile);
        }
    };

    return (
        <div className="upload">
            {!file ? (
                <div
                    className={`dropzone ${
                        isDragging ? "is-dragging" : ""
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <input
                        id="floor-plan-upload-input"
                        aria-label="Upload floor plan image"
                        className="drop-input"
                        type="file"
                        accept=".jpg,.jpeg,.png"
                        disabled={!isSignedIn}
                        onChange={handleFileChange}
                    />

                    <div className="drop-content">
                        <div className="drop-icon">
                            <UploadIcon size={20} />
                        </div>

                        <p>
                            {isSignedIn
                                ? "Click to upload or just drag and drop"
                                : "Sign in or sign up with Puter to upload"}
                        </p>

                        <p className="help">
                            Maximum file size 10 MB.
                        </p>

                        {error && (
                            <p className="error" role="alert">
                                {error}
                            </p>
                        )}
                    </div>
                </div>
            ) : (
                <div className="upload-status">
                    <div className="status-content">
                        {progress === 100 ? (
                            <CheckCircle2 className="check" />
                        ) : (
                            <ImageIcon className="image" />
                        )}

                        <h3>{file.name}</h3>

                        <div className="progress">
                            <div
                                className="bar"
                                style={{
                                    width: `${progress}%`,
                                }}
                            />

                            <p className="status-text">
                                {progress < 100
                                    ? "Analyzing Floor Plan..."
                                    : "Redirecting..."}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Upload;