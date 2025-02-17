// Drawing the Progress Bar Image
const drawProgressBar = (progress, barSize) => {
    const barWidth = barSize;
    const filledWidth = Math.floor(progress / 100 * barWidth);
    const emptyWidth = barWidth - filledWidth;
    const progressBar = '█'.repeat(filledWidth) + '▒'.repeat(emptyWidth);
    return `[\x1b[32m${progressBar}] \x1b[37m${progress}%`;
}


const progress = (steps, callback, { barSize = 50 } = {}) => {
    const addStep = (step) => {
        const progressPercentage = Math.floor(step / (steps.length-1) * 100);
        process.stdout.clearLine();
        process.stdout.cursorTo(0);
        process.stdout.write(`Progress: ${drawProgressBar(progressPercentage, barSize)}`);
        
        if (step === steps.length-1) callback.call(null, [])
    }
    return {
        addStep
    }
};

module.exports = progress