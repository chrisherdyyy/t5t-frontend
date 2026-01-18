'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { uploads } from '@/lib/wbr-api'
import {
  Upload,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  AlertTriangle,
} from 'lucide-react'
import type { WBRUploadValidationResult, WBRUploadProcessResponse } from '@/types/wbr'

export default function WBRUploadPage() {
  const router = useRouter()
  const queryClient = useQueryClient()

  const [file, setFile] = useState<File | null>(null)
  const [content, setContent] = useState('')
  const [inputMode, setInputMode] = useState<'file' | 'paste'>('file')
  const [validationResult, setValidationResult] = useState<WBRUploadValidationResult | null>(null)
  const [processResult, setProcessResult] = useState<WBRUploadProcessResponse | null>(null)

  const validateMutation = useMutation({
    mutationFn: async () => {
      const input = inputMode === 'file' ? file! : content
      return uploads.validate(input)
    },
    onSuccess: (data) => {
      setValidationResult(data)
    },
  })

  const processMutation = useMutation({
    mutationFn: async (force: boolean) => {
      const input = inputMode === 'file' ? file! : content
      return uploads.process(input, { force })
    },
    onSuccess: (data) => {
      setProcessResult(data)
      queryClient.invalidateQueries({ queryKey: ['wbr-scorecard'] })
      queryClient.invalidateQueries({ queryKey: ['wbr-uploads'] })
    },
  })

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setValidationResult(null)
      setProcessResult(null)
    }
  }, [])

  const handleContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value)
    setValidationResult(null)
    setProcessResult(null)
  }, [])

  const handleValidate = () => {
    if ((inputMode === 'file' && file) || (inputMode === 'paste' && content.trim())) {
      validateMutation.mutate()
    }
  }

  const handleProcess = (force: boolean = false) => {
    if ((inputMode === 'file' && file) || (inputMode === 'paste' && content.trim())) {
      processMutation.mutate(force)
    }
  }

  const canValidate = (inputMode === 'file' && file) || (inputMode === 'paste' && content.trim())

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Upload WBR</h1>
        <p className="text-sm text-gray-500 mt-1">
          Upload your Weekly Business Review markdown document
        </p>
      </div>

      {/* Input Mode Toggle */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => {
              setInputMode('file')
              setValidationResult(null)
              setProcessResult(null)
            }}
            className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors ${
              inputMode === 'file'
                ? 'border-amber-500 bg-amber-50 text-amber-700'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Upload className="w-5 h-5 mx-auto mb-1" />
            <span className="text-sm font-medium">Upload File</span>
          </button>
          <button
            onClick={() => {
              setInputMode('paste')
              setValidationResult(null)
              setProcessResult(null)
            }}
            className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors ${
              inputMode === 'paste'
                ? 'border-amber-500 bg-amber-50 text-amber-700'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <FileText className="w-5 h-5 mx-auto mb-1" />
            <span className="text-sm font-medium">Paste Content</span>
          </button>
        </div>

        {/* File Upload */}
        {inputMode === 'file' && (
          <div>
            <label
              htmlFor="wbr-file"
              className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
            >
              {file ? (
                <>
                  <FileText className="w-10 h-10 text-amber-500 mb-2" />
                  <span className="text-sm font-medium text-gray-900">{file.name}</span>
                  <span className="text-xs text-gray-500 mt-1">Click to change file</span>
                </>
              ) : (
                <>
                  <Upload className="w-10 h-10 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">
                    Click to upload or drag and drop
                  </span>
                  <span className="text-xs text-gray-500 mt-1">.md or .txt file</span>
                </>
              )}
            </label>
            <input
              id="wbr-file"
              type="file"
              accept=".md,.txt,.markdown"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        )}

        {/* Paste Content */}
        {inputMode === 'paste' && (
          <div>
            <textarea
              value={content}
              onChange={handleContentChange}
              placeholder="Paste your WBR markdown content here..."
              className="w-full h-64 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none font-mono text-sm"
            />
          </div>
        )}

        {/* Validate Button */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleValidate}
            disabled={!canValidate || validateMutation.isPending}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {validateMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Validate
          </button>
        </div>
      </div>

      {/* Validation Result */}
      {validationResult && (
        <div className={`bg-white rounded-lg shadow-sm border p-6 ${
          validationResult.is_valid ? 'border-green-200' : 'border-yellow-200'
        }`}>
          <div className="flex items-start gap-3 mb-4">
            {validationResult.is_valid ? (
              <CheckCircle className="w-6 h-6 text-green-500 shrink-0" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-yellow-500 shrink-0" />
            )}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {validationResult.is_valid ? 'Validation Passed' : 'Validation Issues Found'}
              </h3>
              <p className="text-sm text-gray-500">
                Week of {new Date(validationResult.week_of).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-gray-900">{validationResult.metrics_found}</p>
              <p className="text-xs text-gray-500">Metrics</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-gray-900">{validationResult.projects_found}</p>
              <p className="text-xs text-gray-500">Projects</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-gray-900">{validationResult.functional_updates_found}</p>
              <p className="text-xs text-gray-500">Updates</p>
            </div>
          </div>

          {/* Errors */}
          {validationResult.validation_errors.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-red-700 mb-2">Errors:</p>
              <ul className="space-y-1">
                {validationResult.validation_errors.map((error, i) => (
                  <li key={i} className="text-sm text-red-600 flex items-start gap-2">
                    <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Unknown Owners */}
          {validationResult.unknown_owners.length > 0 && (
            <div className="mb-4 p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm font-medium text-yellow-800 mb-2">
                Unknown Owners ({validationResult.unknown_owners.length}):
              </p>
              <p className="text-sm text-yellow-700">
                {validationResult.unknown_owners.join(', ')}
              </p>
              <p className="text-xs text-yellow-600 mt-2">
                Add these as WBR Participants first, or use &quot;Force Upload&quot; to skip them.
              </p>
            </div>
          )}

          {/* Preview */}
          {validationResult.parsed_data_preview.projects.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Projects Preview:</p>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {validationResult.parsed_data_preview.projects.map((p, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <span className={`w-2 h-2 rounded-full ${
                      p.status === 'green' ? 'bg-green-500' :
                      p.status === 'yellow' ? 'bg-yellow-500' :
                      p.status === 'red' ? 'bg-red-500' : 'bg-gray-300'
                    }`} />
                    <span className="text-gray-900">{p.name}</span>
                    <span className="text-gray-500 text-xs">({p.owners.join(', ')})</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Process Buttons */}
          <div className="flex justify-end gap-3">
            {!validationResult.is_valid && validationResult.unknown_owners.length > 0 && (
              <button
                onClick={() => handleProcess(true)}
                disabled={processMutation.isPending}
                className="inline-flex items-center gap-2 px-4 py-2 border border-yellow-500 text-yellow-700 rounded-lg hover:bg-yellow-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {processMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Force Upload (Skip Unknown)
              </button>
            )}
            <button
              onClick={() => handleProcess(false)}
              disabled={!validationResult.is_valid || processMutation.isPending}
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {processMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Process & Save
            </button>
          </div>
        </div>
      )}

      {/* Process Result */}
      {processResult && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-start gap-3 mb-4">
            <CheckCircle className="w-6 h-6 text-green-500 shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-green-900">Upload Successful</h3>
              <p className="text-sm text-green-700">
                WBR for week of {new Date(processResult.week_of).toLocaleDateString()} has been processed.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-white rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-gray-900">{processResult.metrics_created}</p>
              <p className="text-xs text-gray-500">Metrics Created</p>
            </div>
            <div className="bg-white rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-gray-900">{processResult.metric_entries_created}</p>
              <p className="text-xs text-gray-500">Entries Added</p>
            </div>
            <div className="bg-white rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-gray-900">{processResult.projects_created}</p>
              <p className="text-xs text-gray-500">Projects Created</p>
            </div>
            <div className="bg-white rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-gray-900">{processResult.project_updates_created}</p>
              <p className="text-xs text-gray-500">Updates Added</p>
            </div>
          </div>

          {processResult.validation_errors.length > 0 && (
            <div className="mb-4 p-3 bg-yellow-100 rounded-lg">
              <p className="text-sm font-medium text-yellow-800 mb-1">Warnings:</p>
              <ul className="text-sm text-yellow-700 space-y-1">
                {processResult.validation_errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setFile(null)
                setContent('')
                setValidationResult(null)
                setProcessResult(null)
              }}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Upload Another
            </button>
            <button
              onClick={() => router.push('/wbr')}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
            >
              View Dashboard
            </button>
          </div>
        </div>
      )}

      {/* Error State */}
      {(validateMutation.error || processMutation.error) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-500 shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-red-900">Error</h3>
              <p className="text-sm text-red-700">
                {(validateMutation.error as Error)?.message ||
                  (processMutation.error as Error)?.message ||
                  'An unexpected error occurred'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
