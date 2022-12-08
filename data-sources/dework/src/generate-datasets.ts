/* eslint @typescript-eslint/no-var-requires: "off" */
const createObjectCsvWriter = require('csv-writer').createObjectCsvWriter

loadDeworkData()

async function loadDeworkData() {
  console.info('loadDeworkData')

  const citizensJson = require('../../citizens/output/citizens.json')
  for (const passportId in citizensJson) {
    console.info('passportId:', passportId)

    const citizen = citizensJson[passportId]
    console.info('citizen:', citizen)

    const ethAddress: string = citizen.ownerAddress
    console.info('ethAddress:', ethAddress)

    const writer = createObjectCsvWriter({
      path: `output/dework-${passportId}.csv`,
      header: [
        { id: 'week_end', title: 'week_end' },
        { id: 'tasks_completed', title: 'tasks_completed' },
        { id: 'task_points', title: 'task_points' },
      ],
    })
    const csvRows = []

    const response: Response = await fetch(
      `https://api.deworkxyz.com/v1/reputation/${ethAddress}`
    )
    const json = await response.json()
    console.info('json:', json)

    const tasks = json.tasks
    console.info('tasks:', tasks)

    // Iterate every week from the week of [Sun May-29-2022 → Sun Jun-05-2022] until now
    const weekEndDate: Date = new Date('2022-06-05T00:00:00Z')
    console.info('weekEndDate:', weekEndDate)
    const nowDate: Date = new Date()
    console.info('nowDate:', nowDate)
    while (nowDate.getTime() > weekEndDate.getTime()) {
      // Count the number of tasks completed during the week
      let taskCount = 0
      let taskPoints = 0
      const weekBeginDate: Date = new Date(
        weekEndDate.getTime() - 7 * 24 * 60 * 60 * 1000
      )
      // console.info('weekBeginDate:', weekBeginDate)
      if (tasks.length > 0) {
        tasks.forEach((task: any) => {
          if (task.workspace.organization.name == 'Nation3') {
            const taskDate: Date = new Date(task.date)
            if (
              taskDate.getTime() > weekBeginDate.getTime() &&
              taskDate.getTime() <= weekEndDate.getTime()
            ) {
              console.info('taskDate:', taskDate)
              taskCount++

              console.info('task.points:', task.points)
              if (task.points) {
                taskPoints += task.points
              }
            }
          }
        })
      }
      console.info(
        weekEndDate.toISOString().substring(0, 10) + ' taskCount:',
        taskCount + ', taskPoints: ' + taskPoints
      )

      // Export to CSV
      const csvRow = {
        week_end: weekEndDate.toISOString().substring(0, 10),
        tasks_completed: taskCount,
        task_points: taskPoints,
      }
      csvRows.push(csvRow)

      // Increase week end date by 7 days
      weekEndDate.setDate(weekEndDate.getDate() + 7)
      // console.info('weekEndDate:', weekEndDate)
    }

    writer.writeRecords(csvRows)
  }
}
