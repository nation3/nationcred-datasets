const Passport = require('../abis/Passport.json')

const Web3 = require('web3')

/* eslint @typescript-eslint/no-var-requires: "off" */
const createObjectCsvWriter = require('csv-writer').createObjectCsvWriter

const web3 = new Web3('https://rpc.ankr.com/eth')
console.info('web3.version:', web3.version)

const PassportContract = new web3.eth.Contract(Passport.abi, '0x3337dac9f251d4e403d6030e18e3cfb6a2cb1333')
console.info('PassportContract._address:', PassportContract._address)

loadDeworkData()

async function loadDeworkData() {
  console.info('loadDeworkData')

  const nextId: number = await getNextId()
  console.info('nextId:', nextId)

  let passportId: number
  for (passportId = 0; passportId < nextId; passportId++) {
    console.info('passportId:', passportId)

    const signerAddress: string = await getSigner(passportId)
    console.info('signerAddress:', signerAddress)

    const writer = createObjectCsvWriter({
      path: `dework-${signerAddress}.csv`,
      header: [
        { id: 'week_end', title: 'week_end' },
        { id: 'tasks_completed', title: 'tasks_completed' }
      ]
    })
    const csvRows = []

    const response: Response = await fetch(`https://api.deworkxyz.com/v1/reputation/${signerAddress}`)
    const json = await response.json()
    console.info('json:', json)

    const tasks = json.tasks
    console.info('tasks:', tasks)

    // Iterate every Sunday from 2022-05-29 until now
    const weekEndDate: Date = new Date('2022-05-29T23:59:59Z')
    console.info('weekEndDate:', weekEndDate)
    const nowDate: Date = new Date()
    console.info('nowDate:', nowDate)
    while (nowDate.getTime() > weekEndDate.getTime()) {
      // Count the number of tasks completed during the week
      let task_count = 0
      const weekBeginDate: Date = new Date(weekEndDate.getTime() - 7*24*60*60*1000)
      // console.info('weekBeginDate:', weekBeginDate)
      if (tasks.length > 0) {
        tasks.forEach((task: any) => {
          if (task.workspace.organization.name == 'Nation3') {
            const taskDate: Date = new Date(task.date)
            if ((taskDate.getTime() > weekBeginDate.getTime()) && (taskDate.getTime() <= weekEndDate.getTime())) {
              console.info('taskDate:', taskDate)
              task_count++
            }
          }
        })
      }
      console.info(weekEndDate.toISOString().substring(0, 10) + ' task_count:', task_count)
      
      // Export to CSV
      const csvRow = {
        week_end: weekEndDate.toISOString().substring(0, 10),
        tasks_completed: task_count
      }
      csvRows.push(csvRow)

      // Increase week end date by 7 days
      weekEndDate.setDate(weekEndDate.getDate() + 7)
      // console.info('weekEndDate:', weekEndDate)
    }

    writer.writeRecords(csvRows)
  }
}

async function getNextId(): Promise<number> {
  console.info('getNextId')
  return await PassportContract.methods.getNextId().call()
}

async function getSigner(passportId: number): Promise<string> {
  console.info('getSigner')
  return await PassportContract.methods.signerOf(passportId).call()
}
