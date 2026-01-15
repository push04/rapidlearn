// Export all Inngest functions
import { processDocument } from './process-document';
import { analyzeYouTube } from './youtube-analysis';
import { generateVideo } from './generate-video';
import { generateQuizBatch, generatePodcast, extractKnowledge } from './quiz-podcast';
import { gradeHandwriting } from './grade-handwriting';
import { predictExam } from './predict-exam';
import { runMediSim } from './medisim';
import { runLexMind } from './lexmind';
import { generateSystemArchitecture } from './system-nexus';

// Export for individual use if needed
export {
    processDocument,
    analyzeYouTube,
    generateVideo,
    generateQuizBatch,
    generatePodcast,
    extractKnowledge,
    gradeHandwriting,
    predictExam,
    runMediSim,
    runLexMind,
    generateSystemArchitecture
};

// Array of all functions (used in API route)
export const allFunctions = [
    processDocument,
    analyzeYouTube,
    generateVideo,
    generateQuizBatch,
    generatePodcast,
    extractKnowledge,
    gradeHandwriting,
    predictExam,
    runMediSim,
    runLexMind,
    generateSystemArchitecture
];
