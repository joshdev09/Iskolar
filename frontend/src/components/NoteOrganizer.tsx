import { useCallback } from "react";
import { useDropzone, type FileRejection } from "react-dropzone";
import { useNoteOrganizer } from "@/hooks/useNoteOrganizer";
import { NoteResults } from "@/components/NoteResults";

const ACCEPTED_FILE_TYPES = {
  "image/png": [".png"],
  "image/jpeg": [".jpg", ".jpeg"],
  "application/pdf": [".pdf"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
  "application/msword": [".doc"],
};

export function NoteOrganizer() {
  const {
    files,
    isLoading,
    isCopied,
    error,
    result,
    addFiles,
    removeFile,
    handleUpload,
    handleCopy,
    setError,
  } = useNoteOrganizer();

  const onDrop = useCallback(
    (acceptedFiles: File[], rejections: FileRejection[]) => {
      if (rejections.length > 0) {
        setError("Invalid file type. Please upload a PNG, JPG, PDF, or Word document.");
        return;
      }
      if (acceptedFiles.length > 0) addFiles(acceptedFiles);
    },
    [addFiles, setError]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 5,
    accept: ACCEPTED_FILE_TYPES,
  });

  return (
    <div className="w-full h-full overflow-y-auto p-4 md:p-8 bg-gray-50 text-[#333333]">
      <div className="w-full space-y-8 pb-24 flex flex-col items-center">

        {/* Upload Card */}
        <div className="max-w-3xl w-full bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-2xl font-semibold text-center mb-6">Upload Notes</h2>

          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors duration-200 ${
              isDragActive
                ? "border-blue-400 bg-blue-50"
                : "border-gray-300 bg-gray-50 hover:bg-gray-100"
            }`}
          >
            <input {...getInputProps()} />
            {isDragActive ? (
              <p className="text-blue-600 font-medium">Drop the file here...</p>
            ) : (
              <p className="text-gray-500">
                Drag & drop a{" "}
                <span className="font-semibold text-gray-700">PNG, JPG, PDF,</span> or{" "}
                <span className="font-semibold text-gray-700">Word</span> file here, or click to select
              </p>
            )}
          </div>

          {/* Hint */}
          <div className="flex items-start space-x-1 mt-3">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-5 shrink-0 mt-0.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
            <p className="text-[#333333] font-normal text-sm">For precise results, upload only 1–2 files per topic.</p>
          </div>

          {/* File list + action */}
          {files.length > 0 && (
            <div className="mt-6 flex flex-col bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex flex-col space-y-2 mb-4">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-white p-2 rounded border border-gray-200">
                    <p className="text-sm text-gray-700 truncate max-w-xs">
                      <strong>Selected:</strong> {file.name}
                    </p>
                    <button
                      onClick={() => removeFile(index)}
                      disabled={isLoading}
                      aria-label={`Remove ${file.name}`}
                      className="ml-3 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full w-6 h-6 flex items-center justify-center font-bold text-sm transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={handleUpload}
                disabled={isLoading}
                className={`px-6 py-2 cursor-pointer self-end rounded-lg font-medium text-[#333333] transition-colors duration-200 ${
                  isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-[#E8F5BD] hover:bg-[#C7EABB]"
                }`}
              >
                {isLoading ? "Processing..." : "Organize Notes"}
              </button>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg border border-red-100 text-sm">
              <strong>Error:</strong> {error}
            </div>
          )}
        </div>

        {/* Results Card */}
        {result && (
          <NoteResults data={result} isCopied={isCopied} onCopy={handleCopy} />
        )}
      </div>
    </div>
  );
}
