
import React, { useState, useEffect, useCallback } from 'react';
import { Phase, Task, TaskStatus, UploadedFile, FileStatus, Annotation } from './types';
import { getAIAssistance, summarizeFileContent } from './services/geminiService';
import Header from './components/Header';
import ProgressBar from './components/ProgressBar';
import PhaseCard from './components/PhaseCard';
import Modal from './components/Modal';
import { InfoIcon, DownloadIcon } from './components/Icons';
import JSZip from 'jszip';
import saveAs from 'file-saver'; // This will be polyfilled by esm.sh

const initialPhases: Phase[] = [
  {
    id: 'phase1',
    title: 'Phase 1: Data Collection (1 week)',
    subtitle: 'Day 1-2: Initial Data Gathering',
    tasks: [
      {
        id: 't1',
        title: 'Export Support Tickets',
        description: 'Export the most recent 50-100 tickets to PDF format.',
        details: [
          'Prioritize tickets related to PACS Viewer, annotations, and dictation issues.',
          'These PDFs are crucial for training the language model to understand common issues and resolution patterns.',
        ],
        status: TaskStatus.ToDo,
        files: [],
        fileConfig: { accept: 'application/pdf', maxFiles: 100, folder: 'SupportTickets' },
      },
      {
        id: 't2',
        title: 'Screen Capture Collection',
        description: 'Capture 5-10 typical workflow scenarios in PACS Viewer.',
        details: [
          'Use existing screen capture software on the workstation.',
          'Include examples of annotation processes.',
          'Aim for 2-3 hours of total screen capture footage.',
          'Visual data helps in developing the model\'s understanding of UI interactions and workflow patterns.',
        ],
        status: TaskStatus.ToDo,
        files: [],
        fileConfig: { accept: 'image/*,video/*', maxFiles: 20, folder: 'ScreenCaptures' },
      },
    ],
  },
  {
    id: 'phase2',
    title: '',
    subtitle: 'Day 3-4: Log Files and Audio Collection',
    tasks: [
      {
        id: 't3',
        title: 'Collect Log Files',
        description: 'Locate and copy log files for PACS, EMR, DICOM, and HL7 systems.',
        details: [
          'Copy the most recent week\'s worth of log files to a designated secure location.',
          'Log files will be used to train the model on system behavior and error patterns.',
        ],
        status: TaskStatus.ToDo,
        files: [],
        fileConfig: { accept: '.log,text/plain', maxFiles: 50, folder: 'LogFiles' },
      },
      {
        id: 't4',
        title: 'Gather Dictation Audio Samples',
        description: 'Collect 10-15 anonymized dictation audio samples.',
        details: [
          'Ensure a mix of different radiologists and study types.',
          'If dictation audio is unavailable, collect any relevant audio recordings from support calls.',
          'Audio data will help in developing speech-to-text capabilities and understanding dictation-related issues.',
        ],
        status: TaskStatus.ToDo,
        files: [],
        fileConfig: { accept: 'audio/*', maxFiles: 20, folder: 'AudioSamples' },
      },
    ],
  },
  {
    id: 'phase3',
    title: '',
    subtitle: 'Day 5: Email Correspondence and Observations',
    tasks: [
      {
        id: 't5',
        title: 'Compile Email Correspondence',
        description: 'Export the last month\'s worth of support-related emails.',
        details: [
            'Focus on emails that show the triage process and common communication patterns.',
            'Remove any sensitive or identifying information.',
            'Email data will be crucial for training the model on communication styles and triage processes.'
        ],
        status: TaskStatus.ToDo,
        files: [],
        fileConfig: { accept: '.eml,.msg,text/plain', maxFiles: 100, folder: 'Emails' },
      },
      {
        id: 't6',
        title: 'Document Initial Observations',
        description: 'Create a brief report noting any initial observations or patterns.',
        details: [
            'Focus on insights that could be relevant for developing the GenAI tool.'
        ],
        status: TaskStatus.ToDo,
        files: [],
        fileConfig: { accept: 'text/markdown,.md,text/plain', maxFiles: 5, folder: 'Observations' },
      },
    ],
  },
];


const App: React.FC = () => {
  const [phases, setPhases] = useState<Phase[]>(initialPhases);
  const [progress, setProgress] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', body: '' });
  const [isLoadingAI, setIsLoadingAI] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const allTasks = phases.flatMap(p => p.tasks);
    const completedTasks = allTasks.filter(t => t.status === TaskStatus.Done);
    const newProgress = allTasks.length > 0 ? (completedTasks.length / allTasks.length) * 100 : 0;
    setProgress(newProgress);
  }, [phases]);

  const updateTask = (taskId: string, updater: (task: Task) => Task) => {
    setPhases(prevPhases =>
      prevPhases.map(phase => ({
        ...phase,
        tasks: phase.tasks.map(task =>
          task.id === taskId ? updater(task) : task
        ),
      }))
    );
  };

  const handleStatusChange = useCallback((taskId: string, newStatus: TaskStatus) => {
    updateTask(taskId, task => ({ ...task, status: newStatus }));
  }, []);
  
  const handleFilesAdd = useCallback((taskId: string, newFiles: File[]) => {
      const taskToUpdate = phases.flatMap(p => p.tasks).find(t => t.id === taskId);
      if (!taskToUpdate || !taskToUpdate.fileConfig) return;

      const totalFiles = taskToUpdate.files.length + newFiles.length;
      if (totalFiles > taskToUpdate.fileConfig.maxFiles) {
          alert(`You can only upload a maximum of ${taskToUpdate.fileConfig.maxFiles} files for this task.`);
          return;
      }
      
      newFiles.forEach(async (file) => {
        const fileId = `${file.name}-${file.lastModified}-${Math.random()}`;
        try {
            const content = await file.arrayBuffer();
            
            const newUploadedFile: UploadedFile = {
                id: fileId,
                name: file.name,
                type: file.type,
                content,
                summary: 'Awaiting summary...',
                status: FileStatus.Summarizing,
                annotations: [],
            };
            
            updateTask(taskId, task => ({ ...task, files: [...task.files, newUploadedFile] }));
            
            const fileForSummary = new File([content], file.name, { type: file.type });
            const summary = await summarizeFileContent(taskToUpdate, fileForSummary);

            updateTask(taskId, task => ({
                ...task,
                files: task.files.map(f => f.id === fileId ? { ...f, summary, status: FileStatus.Complete } : f)
            }));

        } catch (error) {
            console.error("Error processing file:", error);
            const errorMessage = error instanceof Error ? error.message : "Could not read file.";
            const errorFile: UploadedFile = {
                id: fileId,
                name: file.name,
                type: file.type,
                content: new ArrayBuffer(0),
                summary: `Error: ${errorMessage}`,
                status: FileStatus.Error,
                annotations: [],
            };
            updateTask(taskId, task => ({ ...task, files: [...task.files, errorFile] }));
        }
    });

  }, [phases]);

  const handleFileRemove = useCallback((taskId: string, fileId: string) => {
      updateTask(taskId, task => ({ ...task, files: task.files.filter(f => f.id !== fileId) }));
  }, []);

  const handleAnnotationAdd = useCallback((taskId: string, fileId: string, text: string) => {
    const newAnnotation: Annotation = { id: `ann-${Date.now()}`, text };
    updateTask(taskId, task => ({
        ...task,
        files: task.files.map(file => 
            file.id === fileId 
                ? { ...file, annotations: [...file.annotations, newAnnotation] }
                : file
        )
    }));
  }, []);

  const handleAnnotationRemove = useCallback((taskId: string, fileId: string, annotationId: string) => {
      updateTask(taskId, task => ({
          ...task,
          files: task.files.map(file =>
              file.id === fileId
                  ? { ...file, annotations: file.annotations.filter(a => a.id !== annotationId) }
                  : file
          )
      }));
  }, []);

  const handleGetAITip = async (task: Task) => {
    setIsLoadingAI(task.id);
    setModalContent({ title: `AI Assistant for "${task.title}"`, body: '' });
    setIsModalOpen(true);

    const prompt = `
      As an expert in AI and data collection for RAG systems in a healthcare IT environment, provide concise, actionable advice for the following task. The user is an IT Support Engineer named Ann.

      Task Title: ${task.title}
      Task Description: ${task.description}
      Task Details: ${task.details.join('; ')}

      Your advice should focus on:
      1.  **Best practices** for collecting this specific type of data.
      2.  How to ensure the data is **high-quality and relevant** for fine-tuning a language model for Radiology IT support.
      3.  Crucial reminders about **data privacy and anonymization (like PHI)**.
      4.  A practical, pro-level tip that an expert would know.

      Format your response as clean Markdown.
    `;
    
    try {
      const tip = await getAIAssistance(prompt);
      setModalContent(prev => ({ ...prev, body: tip }));
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      setModalContent(prev => ({ ...prev, body: `**Error:** Could not fetch AI assistance. ${errorMessage}` }));
    } finally {
      setIsLoadingAI(null);
    }
  };
  
  const handleExportData = async () => {
    setIsExporting(true);
    const zip = new JSZip();
    let fileCount = 0;
    const annotationsByFolder: { [folderName: string]: { [fileName: string]: Annotation[] } } = {};

    phases.forEach(phase => {
        phase.tasks.forEach(task => {
            if(task.fileConfig && task.files.length > 0) {
                const folderName = task.fileConfig.folder;
                const folder = zip.folder(folderName);
                if (folder) {
                    task.files.forEach(uploadedFile => {
                        folder.file(uploadedFile.name, uploadedFile.content);
                        fileCount++;
                        if (uploadedFile.annotations.length > 0) {
                            if (!annotationsByFolder[folderName]) {
                                annotationsByFolder[folderName] = {};
                            }
                            annotationsByFolder[folderName][uploadedFile.name] = uploadedFile.annotations;
                        }
                    });
                }
            }
        });
    });

    for (const folderName in annotationsByFolder) {
        const folder = zip.folder(folderName);
        if (folder) {
            const annotationsJson = JSON.stringify(annotationsByFolder[folderName], null, 2);
            folder.file('_annotations.json', annotationsJson);
        }
    }
    
    if (fileCount === 0) {
        alert("No files have been uploaded to export.");
        setIsExporting(false);
        return;
    }

    try {
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        saveAs(zipBlob, 'RAG_Data_Collection_Export.zip');
    } catch (error) {
        console.error("Error generating zip file:", error);
        alert(`Failed to generate the zip file. Please try again. Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
        setIsExporting(false);
    }
  };


  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <Header />
        <div className="mt-8 flex flex-col sm:flex-row justify-between sm:items-end gap-4">
            <div className="flex-grow">
                <ProgressBar progress={progress} />
            </div>
            <button 
                onClick={handleExportData}
                disabled={isExporting}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-50 dark:focus:ring-offset-slate-900 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-wait"
            >
                {isExporting ? (
                    <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Exporting...</span>
                    </>
                ) : (
                    <>
                        <DownloadIcon className="w-5 h-5"/>
                        <span>Export Data</span>
                    </>
                )}
            </button>
        </div>
        
        <div className="mt-4 p-4 bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg flex items-start space-x-3">
            <InfoIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" />
            <p className="text-sm text-blue-800 dark:text-blue-200">
                This board guides the data collection for the Radiology IT Support GenAI tool. Update the status of each task, upload the required files, and use the ✨ AI Assistant for tips on ensuring data quality.
            </p>
        </div>

        <main className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {phases.map(phase => (
            <PhaseCard
              key={phase.id}
              phase={phase}
              onStatusChange={handleStatusChange}
              onGetAITip={handleGetAITip}
              isLoadingAI={isLoadingAI}
              onFilesAdd={handleFilesAdd}
              onFileRemove={handleFileRemove}
              onAnnotationAdd={handleAnnotationAdd}
              onAnnotationRemove={handleAnnotationRemove}
            />
          ))}
        </main>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalContent.title}
      >
        {modalContent.body ? (
             <div
             className="prose prose-sm dark:prose-invert max-w-none"
             dangerouslySetInnerHTML={{ __html: modalContent.body.replace(/\n/g, '<br />') }}
            />
        ) : (
          <div className="flex items-center justify-center space-x-2 py-8">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="ml-2 text-slate-600 dark:text-slate-400">Generating expert advice...</span>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default App;