const progressBar = require("./utils/progressBar");

const steps = Array.from({length: 20});

const delay = (time) => new Promise((resolve) => setTimeout(() => resolve(), time))

const main = async () => {
    const progress = progressBar(steps, () => {
        console.log(`\n\n🍻 ACABOOOOUUUUU!!!!!`)
    }, { barSize: 80 })
    
    
    for (const [index, step] of steps.entries()) {
        await delay(1000)
        progress.addStep(index)
    }
}

main().then()


