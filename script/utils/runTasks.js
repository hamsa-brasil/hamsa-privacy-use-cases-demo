/**
 * Collect and send to log a sequence of functions or programs to make more clear the expected steps
 *
 * @param {Array.<{title: string, fn: Function | AsyncFunction, args: [] }>} [tasks] - Array of objects containing title: string, fn: Function or AsyncFunction, args: Array with arguments to fn property
 */
async function runTasks(tasks = []) {
    if (!!tasks.length) {
        console.log(`The steps are: \n`)
        console.log(tasks.map((t, index) => `${index + 1}. ${t.title}`).join("\n"))
        console.log("\n")

        for (const [index, task] of tasks.entries()) {
            const step = index + 1
            console.log(`\n🔹 ${step}. Starting ${task.title}: ${index + 1} of ${tasks.length}\n`)
            if (task.fn.constructor.name === "AsyncFunction") await task.fn.apply(null, task.args)
            else task.fn.call(null, task.args ?? [])
            console.log(`\n✅ Step ${index + 1} of ${tasks.length} done\n`)
        }
    }
}


module.exports = runTasks