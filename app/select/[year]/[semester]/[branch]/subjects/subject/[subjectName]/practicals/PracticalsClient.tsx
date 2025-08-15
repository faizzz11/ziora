'use client';

import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Play, Plus, Edit, Trash2, Save, X, FlaskConical, ClipboardList, BookOpen, Code, BarChart3, Target, Video, Microscope } from "lucide-react";

interface CodeFile {
  name: string;
  code: string;
}

interface Experiment {
  experimentNo: number;
  title: string;
  aim: string;
  theory: string;
  codeFiles: CodeFile[];
  output: string;
  conclusion: string;
  videoUrl: string;
}

interface PracticalsClientProps {
  experiments: Experiment[];
  subject: any;
  subjectName: string;
  year: string;
  semester: string;
  branch: string;
}

// Helper function to detect programming language from file extension
const getLanguageFromFileName = (fileName: string): string => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'py':
      return 'python';
    case 'java':
      return 'java';
    case 'js':
      return 'javascript';
    case 'ts':
      return 'typescript';
    case 'html':
      return 'html';
    case 'css':
      return 'css';
    case 'cpp':
    case 'cc':
    case 'cxx':
      return 'cpp';
    case 'c':
      return 'c';
    case 'php':
      return 'php';
    case 'rb':
      return 'ruby';
    case 'go':
      return 'go';
    case 'rs':
      return 'rust';
    case 'sql':
      return 'sql';
    case 'json':
      return 'json';
    case 'xml':
      return 'xml';
    case 'yaml':
    case 'yml':
      return 'yaml';
    case 'sh':
    case 'bash':
      return 'bash';
    default:
      return 'text';
  }
};

const convertToEmbedUrl = (url: string): string => {
  if (!url) return '';
  
  if (url.includes('youtube.com/embed/')) return url;
  
  const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(youtubeRegex);
  
  if (match) {
    return `https://www.youtube.com/embed/${match[1]}`;
  }
  
  return url;
};

const isValidYouTubeUrl = (url: string): boolean => {
  if (!url) return true;
  
  const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  return youtubeRegex.test(url);
};

// API helper functions
const saveExperimentsToAPI = async (year: string, semester: string, branch: string, subjectName: string, experiments: Experiment[]) => {
  try {
    const response = await fetch('/api/content', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        year,
        semester,
        branch,
        subject: subjectName,
        contentType: 'practicals',
        content: { experiments },
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to save experiments');
    }

    return await response.json();
  } catch (error) {
    console.error('Error saving experiments:', error);
    throw error;
  }
};

const updateExperimentInAPI = async (year: string, semester: string, branch: string, subjectName: string, experiments: Experiment[]) => {
  try {
    const response = await fetch('/api/content', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        year,
        semester,
        branch,
        subject: subjectName,
        contentType: 'practicals',
        content: { experiments },
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to update experiment');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating experiment:', error);
    throw error;
  }
};

const deleteExperimentFromAPI = async (year: string, semester: string, branch: string, subjectName: string, experiments: Experiment[]) => {
  try {
    const response = await fetch('/api/content', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        year,
        semester,
        branch,
        subject: subjectName,
        contentType: 'practicals',
        content: { experiments },
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to delete experiment');
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting experiment:', error);
    throw error;
  }
};

// Copy to clipboard function
const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text).then(() => {
    // Create a temporary toast notification
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-all duration-300';
    toast.textContent = '✅ Code copied to clipboard!';
    document.body.appendChild(toast);
    
    // Remove toast after 3 seconds
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 3000);
  }).catch(() => {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    
    // Show toast for fallback too
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-all duration-300';
    toast.textContent = '✅ Code copied to clipboard!';
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 3000);
  });
};

// Component for Experiments tab
const ExperimentsTab = ({ 
  experiments, 
  onAddExperiment, 
  onEditExperiment, 
  onDeleteExperiment,
  editingExperiment,
  editExperimentData,
  setEditExperimentData,
  onSaveExperiment,
  onCancelEdit,
  isAdmin
}: { 
  experiments: Experiment[];
  onAddExperiment: () => void;
  onEditExperiment: (experiment: Experiment) => void;
  onDeleteExperiment: (experimentNo: number) => void;
  editingExperiment: number | null;
  editExperimentData: Partial<Experiment>;
  setEditExperimentData: (data: Partial<Experiment>) => void;
  onSaveExperiment: (experimentNo: number) => void;
  onCancelEdit: () => void;
  isAdmin: boolean;
}) => {
  const [selectedExperiment, setSelectedExperiment] = React.useState<number>(0);

  // Set first experiment as selected when experiments change
  React.useEffect(() => {
    if (experiments.length > 0 && !experiments.find(e => e.experimentNo === selectedExperiment)) {
      setSelectedExperiment(experiments[0].experimentNo);
    }
  }, [experiments, selectedExperiment]);

  const currentExperiment = experiments.find(e => e.experimentNo === selectedExperiment);

  return (
    <div className="space-y-6">
      {/* Add New Experiment Button - Only show for admins */}
      {isAdmin && (
      <div className="flex justify-end mb-6">
        <Button
          onClick={onAddExperiment}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Experiment</span>
        </Button>
      </div>
      )}

      {/* Experiment Tabs */}
      {experiments.length > 0 && (
        <div className="border-b border-border">
          <div className="flex space-x-1 overflow-x-auto">
      {experiments.map((experiment) => (
              <button
                key={experiment.experimentNo}
                onClick={() => setSelectedExperiment(experiment.experimentNo)}
                className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  selectedExperiment === experiment.experimentNo
                    ? 'border-primary text-primary bg-primary/5'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
                }`}
              >
                Exp {experiment.experimentNo}: {experiment.title.length > 20 ? experiment.title.substring(0, 20) + '...' : experiment.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Current Experiment Content */}
      {currentExperiment && (
        <Card className="border-2 border-border shadow-lg bg-card dark:bg-[oklch(0.205_0_0)]">
          <CardHeader className="bg-secondary dark:bg-[oklch(0.205_0_0)] border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                {editingExperiment === currentExperiment.experimentNo ? (
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Experiment No:</label>
                      <Input
                        type="number"
                        value={editExperimentData.experimentNo || ''}
                        onChange={(e) => setEditExperimentData({
                          ...editExperimentData,
                          experimentNo: parseInt(e.target.value) || 0
                        })}
                        className="mt-1"
                        placeholder="Experiment Number"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Title:</label>
                      <Input
                        value={editExperimentData.title || ''}
                        onChange={(e) => setEditExperimentData({
                          ...editExperimentData,
                          title: e.target.value
                        })}
                        className="mt-1"
                        placeholder="Experiment Title"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                      Experiment No: {currentExperiment.experimentNo}
                    </CardTitle>
                    <CardDescription className="text-lg font-semibold text-gray-700 dark:text-gray-400 mt-2">
                      {currentExperiment.title}
                    </CardDescription>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="px-3 py-1">
                  Lab Manual
                </Badge>
                {isAdmin && (
                  editingExperiment === currentExperiment.experimentNo ? (
                  <div className="flex space-x-2">
                    <Button
                        onClick={() => onSaveExperiment(currentExperiment.experimentNo)}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={onCancelEdit}
                      size="sm"
                      variant="outline"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                    isAdmin && (
                  <div className="flex space-x-2">
                    <Button
                          onClick={() => onEditExperiment(currentExperiment)}
                      size="sm"
                      variant="outline"
                      className="hover:bg-blue-50"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                          onClick={() => onDeleteExperiment(currentExperiment.experimentNo)}
                      size="sm"
                      variant="outline"
                      className="hover:bg-red-50 text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                    )
                  )
                )}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-6 space-y-6">
            {/* Aim Section */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3 border-b border-border pb-2 flex items-center gap-2">
                <ClipboardList className="h-5 w-5" />
                Aim:
              </h3>
              {editingExperiment === currentExperiment.experimentNo ? (
                <Textarea
                  value={editExperimentData.aim || ''}
                  onChange={(e) => setEditExperimentData({
                    ...editExperimentData,
                    aim: e.target.value
                  })}
                  className="min-h-[80px]"
                  placeholder="Experiment Aim"
                />
              ) : (
                <p className="text-muted-foreground leading-relaxed">{currentExperiment.aim}</p>
              )}
            </div>

            {/* Theory Section */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3 border-b border-border pb-2 flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Theory:
              </h3>
              {editingExperiment === currentExperiment.experimentNo ? (
                <Textarea
                  value={editExperimentData.theory || ''}
                  onChange={(e) => setEditExperimentData({
                    ...editExperimentData,
                    theory: e.target.value
                  })}
                  className="min-h-[120px]"
                  placeholder="Theory (supports Markdown)"
                />
              ) : (
                <div className="text-muted-foreground leading-relaxed markdown-content">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeHighlight]}
                    components={{
                      h1: ({children}) => <h1 className="text-2xl font-bold text-foreground mb-4 mt-6">{children}</h1>,
                      h2: ({children}) => <h2 className="text-xl font-semibold text-foreground mb-3 mt-5">{children}</h2>,
                      h3: ({children}) => <h3 className="text-lg font-medium text-foreground mb-2 mt-4">{children}</h3>,
                      p: ({children}) => <p className="mb-4 text-muted-foreground leading-relaxed">{children}</p>,
                      ul: ({children}) => <ul className="list-disc list-outside mb-4 space-y-2 text-muted-foreground pl-6">{children}</ul>,
                      ol: ({children}) => <ol className="list-decimal list-outside mb-4 space-y-2 text-muted-foreground pl-6">{children}</ol>,
                      li: ({children}) => <li className="pl-2">{children}</li>,
                      strong: ({children}) => <strong className="font-semibold text-foreground">{children}</strong>,
                      em: ({children}) => <em className="italic">{children}</em>,
                      code: ({children, className}) => {
                        const isInline = !className;
                        return isInline 
                          ? <code className="bg-secondary dark:bg-[oklch(0.269_0_0)] px-2 py-1 rounded text-sm font-mono text-foreground">{children}</code>
                          : <code className={className}>{children}</code>;
                      },
                      pre: ({children}) => <pre className="bg-secondary dark:bg-[oklch(0.269_0_0)] p-4 rounded-lg overflow-x-auto mb-4 text-sm">{children}</pre>,
                      blockquote: ({children}) => <blockquote className="border-l-4 border-border pl-4 italic text-muted-foreground mb-4">{children}</blockquote>,
                      a: ({children, href}) => <a href={href} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">{children}</a>,
                      table: ({children}) => <div className="overflow-x-auto mb-4"><table className="min-w-full border-collapse border border-border">{children}</table></div>,
                      thead: ({children}) => <thead className="bg-secondary dark:bg-[oklch(0.269_0_0)]">{children}</thead>,
                      tbody: ({children}) => <tbody>{children}</tbody>,
                      tr: ({children}) => <tr className="border-b border-border">{children}</tr>,
                      th: ({children}) => <th className="border border-border px-4 py-2 text-left font-semibold text-foreground">{children}</th>,
                      td: ({children}) => <td className="border border-border px-4 py-2 text-muted-foreground">{children}</td>,
                    }}
                  >
                    {currentExperiment.theory}
                  </ReactMarkdown>
                </div>
              )}
            </div>

            {/* Code Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2 flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Code:
                </h3>
                {editingExperiment !== currentExperiment.experimentNo && currentExperiment.codeFiles && currentExperiment.codeFiles.length > 0 && (
                  <Button
                    onClick={() => copyToClipboard(currentExperiment.codeFiles.map(cf => `// ${cf.name}\n${cf.code}`).join('\n\n'))}
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-2 hover:bg-secondary"
                  >
                    <Copy className="h-4 w-4" />
                    <span>Copy All Code</span>
                  </Button>
                )}
              </div>
              {editingExperiment === currentExperiment.experimentNo ? (
                <div className="space-y-4">
                  {editExperimentData.codeFiles?.map((codeFile, index) => (
                    <div key={index} className="border border-border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Input
                          value={codeFile.name}
                          onChange={(e) => {
                            const newCodeFiles = [...(editExperimentData.codeFiles || [])];
                            newCodeFiles[index].name = e.target.value;
                            setEditExperimentData({
                              ...editExperimentData,
                              codeFiles: newCodeFiles
                            });
                          }}
                          placeholder="Code file name (e.g., main.py, index.html)"
                          className="flex-1 mr-2"
                        />
                        <Button
                          onClick={() => {
                            const newCodeFiles = [...(editExperimentData.codeFiles || [])];
                            newCodeFiles.splice(index, 1);
                            setEditExperimentData({
                              ...editExperimentData,
                              codeFiles: newCodeFiles
                            });
                          }}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                <Textarea
                        value={codeFile.code}
                        onChange={(e) => {
                          const newCodeFiles = [...(editExperimentData.codeFiles || [])];
                          newCodeFiles[index].code = e.target.value;
                          setEditExperimentData({
                    ...editExperimentData,
                            codeFiles: newCodeFiles
                          });
                        }}
                  className="min-h-[200px] font-mono text-sm"
                        placeholder="Code content"
                      />
                    </div>
                  ))}
                  <Button
                    onClick={() => {
                      const newCodeFiles = [...(editExperimentData.codeFiles || [])];
                      newCodeFiles.push({ name: `file${newCodeFiles.length + 1}.txt`, code: '' });
                      setEditExperimentData({
                        ...editExperimentData,
                        codeFiles: newCodeFiles
                      });
                    }}
                    variant="outline"
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Code File
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {(currentExperiment.codeFiles || []).map((codeFile, index) => (
                    <div key={index} className="border border-border rounded-lg overflow-hidden">
                      <div className="bg-secondary dark:bg-[oklch(0.269_0_0)] px-4 py-2 border-b border-border">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-foreground">{codeFile.name}</span>
                          <Button
                            onClick={() => copyToClipboard(codeFile.code)}
                            variant="outline"
                            size="sm"
                            className="text-xs"
                          >
                            <Copy className="h-3 w-3 mr-1" />
                            Copy
                          </Button>
                        </div>
                      </div>
                      <div className="bg-[oklch(0.205_0_0)] dark:bg-black overflow-x-auto">
                        <SyntaxHighlighter
                          language={getLanguageFromFileName(codeFile.name)}
                          style={oneDark}
                          customStyle={{
                            margin: 0,
                            borderRadius: 0,
                            background: 'transparent',
                            fontSize: '14px',
                            lineHeight: '1.5',
                            padding: '16px'
                          }}
                          showLineNumbers={true}
                          wrapLines={false}
                          codeTagProps={{
                            style: {
                              background: 'transparent',
                              fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Inconsolata, "Roboto Mono", monospace'
                            }
                          }}
                        >
                          {codeFile.code}
                        </SyntaxHighlighter>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Output Section */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3 border-b border-border pb-2 flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Output:
              </h3>
              {editingExperiment === currentExperiment.experimentNo ? (
                <Textarea
                  value={editExperimentData.output || ''}
                  onChange={(e) => setEditExperimentData({
                    ...editExperimentData,
                    output: e.target.value
                  })}
                  className="min-h-[100px] font-mono text-sm"
                  placeholder="Output (supports Markdown)"
                />
              ) : (
                <div className="bg-secondary dark:bg-[oklch(0.205_0_0)] rounded-lg p-4 markdown-content">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeHighlight]}
                    components={{
                      h1: ({children}) => <h1 className="text-2xl font-bold text-foreground mb-4 mt-6">{children}</h1>,
                      h2: ({children}) => <h2 className="text-xl font-semibold text-foreground mb-3 mt-5">{children}</h2>,
                      h3: ({children}) => <h3 className="text-lg font-medium text-foreground mb-2 mt-4">{children}</h3>,
                      p: ({children}) => <p className="mb-4 text-foreground leading-relaxed">{children}</p>,
                      ul: ({children}) => <ul className="list-disc list-outside mb-4 space-y-2 text-foreground pl-6">{children}</ul>,
                      ol: ({children}) => <ol className="list-decimal list-outside mb-4 space-y-2 text-foreground pl-6">{children}</ol>,
                      li: ({children}) => <li className="pl-2">{children}</li>,
                      strong: ({children}) => <strong className="font-semibold text-foreground">{children}</strong>,
                      em: ({children}) => <em className="italic">{children}</em>,
                      code: ({children, className}) => {
                        const isInline = !className;
                        return isInline 
                          ? <code className="bg-background dark:bg-[oklch(0.145_0_0)] px-2 py-1 rounded text-sm font-mono text-green-400">{children}</code>
                          : <code className={className}>{children}</code>;
                      },
                      pre: ({children}) => <pre className="bg-background dark:bg-[oklch(0.145_0_0)] p-4 rounded-lg overflow-x-auto mb-4 text-sm">{children}</pre>,
                      blockquote: ({children}) => <blockquote className="border-l-4 border-border pl-4 italic text-foreground mb-4">{children}</blockquote>,
                      a: ({children, href}) => <a href={href} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">{children}</a>,
                      table: ({children}) => <div className="overflow-x-auto mb-4"><table className="min-w-full border-collapse border border-border bg-background dark:bg-[oklch(0.145_0_0)] rounded-lg">{children}</table></div>,
                      thead: ({children}) => <thead className="bg-border dark:bg-[oklch(0.269_0_0)]">{children}</thead>,
                      tbody: ({children}) => <tbody>{children}</tbody>,
                      tr: ({children}) => <tr className="border-b border-border">{children}</tr>,
                      th: ({children}) => <th className="border border-border px-4 py-2 text-left font-semibold text-foreground">{children}</th>,
                      td: ({children}) => <td className="border border-border px-4 py-2 text-foreground">{children}</td>,
                    }}
                  >
                    {currentExperiment.output}
                  </ReactMarkdown>
                </div>
              )}
            </div>

            {/* Conclusion Section */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3 border-b border-border pb-2 flex items-center gap-2">
                <Target className="h-5 w-5" />
                Conclusion:
              </h3>
              {editingExperiment === currentExperiment.experimentNo ? (
                <Textarea
                  value={editExperimentData.conclusion || ''}
                  onChange={(e) => setEditExperimentData({
                    ...editExperimentData,
                    conclusion: e.target.value
                  })}
                  className="min-h-[80px]"
                  placeholder="Conclusion"
                />
              ) : (
                <p className="text-muted-foreground leading-relaxed">{currentExperiment.conclusion}</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Component for Experiment Videos tab
const ExperimentVideosTab = ({ 
  experiments,
  onEditVideo,
  onDeleteVideo,
  onAddVideo,
  editingVideo,
  editVideoData,
  setEditVideoData,
  onSaveVideo,
  onCancelVideoEdit,
  isAdmin
}: { 
  experiments: Experiment[];
  onEditVideo: (experiment: Experiment) => void;
  onDeleteVideo: (experimentNo: number) => void;
  onAddVideo: () => void;
  editingVideo: number | null;
  editVideoData: Partial<Experiment>;
  setEditVideoData: (data: Partial<Experiment>) => void;
  onSaveVideo: (experimentNo: number) => void;
  onCancelVideoEdit: () => void;
  isAdmin: boolean;
}) => {
  const [selectedVideoExperiment, setSelectedVideoExperiment] = React.useState<number>(0);

  // Set first experiment as selected when experiments change
  React.useEffect(() => {
    if (experiments.length > 0 && !experiments.find(e => e.experimentNo === selectedVideoExperiment)) {
      setSelectedVideoExperiment(experiments[0].experimentNo);
    }
  }, [experiments, selectedVideoExperiment]);

  const currentVideoExperiment = experiments.find(e => e.experimentNo === selectedVideoExperiment);

  return (
    <div className="space-y-6">
      {/* Add New Video Button - Only show for admins */}
      {isAdmin && (
      <div className="flex justify-end mb-6">
        <Button
          onClick={onAddVideo}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Video</span>
        </Button>
      </div>
      )}

      {/* Video Experiment Tabs */}
      {experiments.length > 0 && (
        <div className="border-b border-border">
          <div className="flex space-x-1 overflow-x-auto">
      {experiments.map((experiment) => (
              <button
                key={experiment.experimentNo}
                onClick={() => setSelectedVideoExperiment(experiment.experimentNo)}
                className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  selectedVideoExperiment === experiment.experimentNo
                    ? 'border-primary text-primary bg-primary/5'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
                }`}
              >
                Exp {experiment.experimentNo}: {experiment.title.length > 20 ? experiment.title.substring(0, 20) + '...' : experiment.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Current Video Experiment Content */}
      {currentVideoExperiment && (
        <Card className="border-2 border-border shadow-lg">
          <CardHeader className="bg-secondary dark:bg-[oklch(0.205_0_0)] border-b">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                {editingVideo === currentVideoExperiment.experimentNo ? (
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Experiment No:</label>
                      <Input
                        type="number"
                        value={editVideoData.experimentNo || ''}
                        onChange={(e) => setEditVideoData({
                          ...editVideoData,
                          experimentNo: parseInt(e.target.value) || 0
                        })}
                        className="mt-1"
                        placeholder="Experiment Number"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Title:</label>
                      <Input
                        value={editVideoData.title || ''}
                        onChange={(e) => setEditVideoData({
                          ...editVideoData,
                          title: e.target.value
                        })}
                        className="mt-1"
                        placeholder="Experiment Title"
                      />
                    </div>
                                          <div>
                        <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                          Video URL:
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            YouTube links supported
                          </span>
                        </label>
                        <div className="flex gap-2">
                          <Input
                            value={editVideoData.videoUrl || ''}
                            onChange={(e) => setEditVideoData({
                              ...editVideoData,
                              videoUrl: e.target.value
                            })}
                            className={`flex-1 ${editVideoData.videoUrl && !isValidYouTubeUrl(editVideoData.videoUrl) ? 'border-red-500' : ''}`}
                            placeholder="https://youtu.be/weJI6Lp9Vw0 or https://www.youtube.com/watch?v=weJI6Lp9Vw0"
                          />
                          {editVideoData.videoUrl && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setEditVideoData({
                                ...editVideoData,
                                videoUrl: ''
                              })}
                              className="px-3"
                            >
                              Clear
                            </Button>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Supports YouTube links in any format (youtu.be, youtube.com/watch, etc.)
                        </p>
                        {editVideoData.videoUrl && !isValidYouTubeUrl(editVideoData.videoUrl) && (
                          <p className="text-xs text-red-500 mt-1">
                            Please enter a valid YouTube URL
                          </p>
                        )}
                        {editVideoData.videoUrl && isValidYouTubeUrl(editVideoData.videoUrl) && (
                          <div className="mt-3">
                            <p className="text-xs text-green-600 mb-2">Video Preview:</p>
                            <div className="aspect-video w-full max-w-md">
                              <iframe
                                src={convertToEmbedUrl(editVideoData.videoUrl)}
                                title="Video Preview"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className="w-full h-full rounded-lg shadow-md"
                              ></iframe>
                            </div>
                          </div>
                        )}
                      </div>
                  </div>
                ) : (
                  <div>
                    <CardTitle className="text-xl font-bold text-foreground">
                      Experiment No: {currentVideoExperiment.experimentNo}
                    </CardTitle>
                    <CardDescription className="text-lg font-semibold text-muted-foreground mt-2">
                      {currentVideoExperiment.title}
                    </CardDescription>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Badge className="bg-secondary dark:bg-[oklch(0.205_0_0)] text-foreground px-3 py-1 flex items-center space-x-1">
                  <Play className="h-3 w-3" />
                  <span>Video</span>
                </Badge>
                {editingVideo === currentVideoExperiment.experimentNo ? (
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => onSaveVideo(currentVideoExperiment.experimentNo)}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={onCancelVideoEdit}
                      size="sm"
                      variant="outline"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  isAdmin && (
                  <div className="flex space-x-2">
                    <Button
                        onClick={() => onEditVideo(currentVideoExperiment)}
                      size="sm"
                      variant="outline"
                      className="hover:bg-blue-50"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                        onClick={() => onDeleteVideo(currentVideoExperiment.experimentNo)}
                      size="sm"
                      variant="outline"
                      className="hover:bg-red-50 text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  )
                )}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-6">
            <div className="aspect-video w-4/5 mx-auto">
              <iframe
                src={convertToEmbedUrl(currentVideoExperiment.videoUrl)}
                title={`${currentVideoExperiment.title} - Video Tutorial`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full rounded-lg shadow-md"
              ></iframe>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default function PracticalsClient({ experiments: initialExperiments, subject, subjectName, year, semester, branch }: PracticalsClientProps) {
  const [activeTab, setActiveTab] = useState('experiments');
  const [experiments, setExperiments] = useState<Experiment[]>(initialExperiments);
  const [editingExperiment, setEditingExperiment] = useState<number | null>(null);
  const [editExperimentData, setEditExperimentData] = useState<Partial<Experiment>>({});
  const [editingVideo, setEditingVideo] = useState<number | null>(null);
  const [editVideoData, setEditVideoData] = useState<Partial<Experiment>>({});
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    type: 'experiment' | 'video' | null;
    experimentNo: number;
    title: string;
  }>({
    isOpen: false,
    type: null,
    experimentNo: 0,
    title: ''
  });

  // Check if user is admin
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    // Check for admin status from localStorage
    const adminData = localStorage.getItem('admin');
    const userData = localStorage.getItem('user');
    
    if (adminData) {
      const admin = JSON.parse(adminData);
      setIsAdmin(admin.role === 'admin' || admin.isAdmin === true);
    } else if (userData) {
      const user = JSON.parse(userData);
      setIsAdmin(user.role === 'admin' || user.isAdmin === true);
    }
  }, []);

  const handleAddExperiment = () => {
    const newExperimentNo = Math.max(...experiments.map(e => e.experimentNo), 0) + 1;
    const newExperiment: Experiment = {
      experimentNo: newExperimentNo,
      title: `New Experiment ${newExperimentNo}`,
      aim: "New experiment aim",
      theory: "New experiment theory",
      codeFiles: [{ name: "main.py", code: "# New experiment code" }],
      output: "New experiment output",
      conclusion: "New experiment conclusion",
      videoUrl: ""
    };
    setExperiments(prev => [...prev, newExperiment]);
    handleEditExperiment(newExperiment);
  };

  const handleEditExperiment = (experiment: Experiment) => {
    setEditingExperiment(experiment.experimentNo);
    setEditExperimentData({
      ...experiment,
      codeFiles: experiment.codeFiles || [{ name: "main.py", code: "" }]
    });
  };

  const handleSaveExperiment = async (experimentNo: number) => {
    if (editExperimentData.title?.trim()) {
      try {
        // Update local state first
        const updatedExperiments = experiments.map(exp => 
          exp.experimentNo === experimentNo 
            ? { ...exp, ...editExperimentData } as Experiment
            : exp
        );
        setExperiments(updatedExperiments);

        // Save to API
        await saveExperimentsToAPI(year, semester, branch, subjectName, updatedExperiments);
        
        // Show success toast
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-all duration-300';
        toast.textContent = '✅ Experiment saved successfully!';
        document.body.appendChild(toast);
        
        setTimeout(() => {
          toast.style.opacity = '0';
          setTimeout(() => {
            document.body.removeChild(toast);
          }, 300);
        }, 3000);

      } catch (error) {
        console.error('Failed to save experiment:', error);
        // Show error toast
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-all duration-300';
        toast.textContent = '❌ Failed to save experiment!';
        document.body.appendChild(toast);
        
        setTimeout(() => {
          toast.style.opacity = '0';
          setTimeout(() => {
            document.body.removeChild(toast);
          }, 300);
        }, 3000);
      }
    }
    setEditingExperiment(null);
    setEditExperimentData({});
  };

  const handleCancelEdit = () => {
    setEditingExperiment(null);
    setEditExperimentData({});
  };

  const handleDeleteExperiment = (experimentNo: number) => {
    const experiment = experiments.find(e => e.experimentNo === experimentNo);
    setDeleteModal({
      isOpen: true,
      type: 'experiment',
      experimentNo,
      title: experiment?.title || ''
    });
  };

  const confirmDeleteExperiment = async (experimentNo: number) => {
    try {
      // Update local state first
      const updatedExperiments = experiments.filter(exp => exp.experimentNo !== experimentNo);
      setExperiments(updatedExperiments);

      // Delete from API
      await deleteExperimentFromAPI(year, semester, branch, subjectName, updatedExperiments);
      
      // Show success toast
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-all duration-300';
      toast.textContent = '✅ Experiment deleted successfully!';
      document.body.appendChild(toast);
      
      setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
          document.body.removeChild(toast);
        }, 300);
      }, 3000);

    } catch (error) {
      console.error('Failed to delete experiment:', error);
      // Show error toast
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-all duration-300';
      toast.textContent = '❌ Failed to delete experiment!';
      document.body.appendChild(toast);
      
      setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
          document.body.removeChild(toast);
        }, 300);
      }, 3000);
    }
    
    setDeleteModal({ isOpen: false, type: null, experimentNo: 0, title: '' });
  };

  const handleEditVideo = (experiment: Experiment) => {
    setEditingVideo(experiment.experimentNo);
    setEditVideoData({
      experimentNo: experiment.experimentNo,
      title: experiment.title,
      videoUrl: experiment.videoUrl,
      codeFiles: experiment.codeFiles || [{ name: "main.py", code: "" }]
    });
  };

  const handleSaveVideo = async (experimentNo: number) => {
    if (editVideoData.title?.trim()) {
      if (editVideoData.videoUrl && !isValidYouTubeUrl(editVideoData.videoUrl)) {
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-all duration-300';
        toast.textContent = '❌ Please enter a valid YouTube URL!';
        document.body.appendChild(toast);
        
        setTimeout(() => {
          toast.style.opacity = '0';
          setTimeout(() => {
            document.body.removeChild(toast);
          }, 300);
        }, 3000);
        return;
      }
      
      try {
        // Update local state first
        const updatedExperiments = experiments.map(exp => 
          exp.experimentNo === experimentNo 
            ? { 
                ...exp, 
                title: editVideoData.title || exp.title,
                videoUrl: editVideoData.videoUrl || exp.videoUrl,
                experimentNo: editVideoData.experimentNo || exp.experimentNo
              }
            : exp
        );
        setExperiments(updatedExperiments);

        // Save to API
        await saveExperimentsToAPI(year, semester, branch, subjectName, updatedExperiments);
        
        // Show success toast
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-all duration-300';
        toast.textContent = '✅ Video saved successfully!';
        document.body.appendChild(toast);
        
        setTimeout(() => {
          toast.style.opacity = '0';
          setTimeout(() => {
            document.body.removeChild(toast);
          }, 300);
        }, 3000);

      } catch (error) {
        console.error('Failed to save video:', error);
        // Show error toast
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-all duration-300';
        toast.textContent = '❌ Failed to save video!';
        document.body.appendChild(toast);
        
        setTimeout(() => {
          toast.style.opacity = '0';
          setTimeout(() => {
            document.body.removeChild(toast);
          }, 300);
        }, 3000);
      }
    }
    setEditingVideo(null);
    setEditVideoData({});
  };

  const handleCancelVideoEdit = () => {
    setEditingVideo(null);
    setEditVideoData({});
  };

  const handleDeleteVideo = (experimentNo: number) => {
    const experiment = experiments.find(e => e.experimentNo === experimentNo);
    setDeleteModal({
      isOpen: true,
      type: 'video',
      experimentNo,
      title: experiment?.title || ''
    });
  };

  const handleAddVideo = () => {
    const newExperimentNo = Math.max(...experiments.map(e => e.experimentNo), 0) + 1;
    const newExperiment: Experiment = {
      experimentNo: newExperimentNo,
      title: `New Video ${newExperimentNo}`,
      aim: "New video experiment aim",
      theory: "New video experiment theory",
      codeFiles: [{ name: "main.py", code: "# New video experiment code" }],
      output: "New video experiment output",
      conclusion: "New video experiment conclusion",
      videoUrl: ""
    };
    setExperiments(prev => [...prev, newExperiment]);
    handleEditVideo(newExperiment);
  };

  const handleCloseDeleteModal = () => {
    setDeleteModal({ isOpen: false, type: null, experimentNo: 0, title: '' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/10 dark:from-black dark:to-gray-950">
      {/* Section Header */}
      <div className="text-center mb-12">
        <div className="flex justify-center mb-8">
          <div className="p-6 mt-10 rounded-3xl bg-secondary dark:bg-[oklch(0.205_0_0)]">
            <div className="w-12 h-12 flex items-center justify-center text-foreground text-2xl">
              <FlaskConical className="h-6 w-6" />
          </div>
        </div>
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
          Practicals Code & Lab Manual
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          Detailed study materials and comprehensive code & lab manuals for <span className="font-semibold">{subject.name}</span>
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex rounded-lg border border-border bg-secondary dark:bg-[oklch(0.205_0_0)] p-1">
          <button
            onClick={() => setActiveTab('experiments')}
            className={`px-6 py-3 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === 'experiments'
                ? 'bg-card dark:bg-[oklch(0.205_0_0)] text-foreground shadow-sm border border-border'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <FlaskConical className="h-4 w-4" />
            Experiments & Code
          </button>
          <button
            onClick={() => setActiveTab('videos')}
            className={`px-6 py-3 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === 'videos'
                ? 'bg-card dark:bg-[oklch(0.205_0_0)] text-foreground shadow-sm border border-border'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Video className="h-4 w-4" />
            Experiment Videos
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-5xl mx-auto">
        {experiments.length > 0 ? (
          <>
            {activeTab === 'experiments' && (
              <ExperimentsTab 
                experiments={experiments}
                onAddExperiment={handleAddExperiment}
                onEditExperiment={handleEditExperiment}
                onDeleteExperiment={handleDeleteExperiment}
                editingExperiment={editingExperiment}
                editExperimentData={editExperimentData}
                setEditExperimentData={setEditExperimentData}
                onSaveExperiment={handleSaveExperiment}
                onCancelEdit={handleCancelEdit}
                isAdmin={isAdmin}
              />
            )}
            {activeTab === 'videos' && (
              <ExperimentVideosTab 
                experiments={experiments}
                onEditVideo={handleEditVideo}
                onDeleteVideo={handleDeleteVideo}
                onAddVideo={handleAddVideo}
                editingVideo={editingVideo}
                editVideoData={editVideoData}
                setEditVideoData={setEditVideoData}
                onSaveVideo={handleSaveVideo}
                onCancelVideoEdit={handleCancelVideoEdit}
                isAdmin={isAdmin}
              />
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="flex justify-center mb-4">
              <Microscope className="h-16 w-16 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No Experiments Available</h3>
            <p className="text-muted-foreground mb-4">
              Experiments for this subject are not yet available.
            </p>
            {isAdmin && (
            <Button
              onClick={handleAddExperiment}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2 mx-auto"
            >
              <Plus className="h-4 w-4" />
              <span>Add First Experiment</span>
            </Button>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-card dark:bg-[oklch(0.205_0_0)] rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Delete {deleteModal.type === 'experiment' ? 'Experiment' : 'Video'}
            </h3>
            <p className="text-muted-foreground mb-6">
              Are you sure you want to delete "{deleteModal.title}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                onClick={handleCloseDeleteModal}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                onClick={() => confirmDeleteExperiment(deleteModal.experimentNo)}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 