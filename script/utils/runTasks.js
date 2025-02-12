async function runTasks(tasks = []) {
    if (!!tasks.length) {
        console.log(`The steps are: \n`)
        console.log(tasks.map((t, index) => `${index + 1}. ${t.title}`).join("\n"))
        console.log("\n")

        for (const [index, task] of tasks.entries()) {
            const step = index + 1
            console.log(`\n🔹 ${step}. Starting ${task.title}: ${index + 1} of ${tasks.length}\n`)
            if (task.fn.constructor.name === "AsyncFunction") await task.fn.apply(null, task.args)
            else task.fn.call(null, task.args)
            console.log(`\n✅ Step ${index + 1} of ${tasks.length} done\n`)
        }
    }
}


module.exports = runTasks