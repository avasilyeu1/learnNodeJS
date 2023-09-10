import { appendFile } from 'fs'
import { exec } from 'child_process';
import { platform } from 'os';

const LOG_FILE = 'src/task2/activityMonitor.log'
const LOG_DELAY_S = 60
const osConstants: { [key in string]: { command: string, delay: number } } = {
  linux: {
    command: `ps -A -o %cpu,%mem,comm | sort -nr | head -n 1`,
    delay: 100,
  },
  darwin: {
    command: `ps -A -o %cpu,%mem,comm | sort -nr | head -n 1`,
    delay: 100,
  },
  win32: {
    command: `powershell "Get-Process | Sort-Object CPU -Descending | Select-Object -Property Name, CPU, WorkingSet -First 1 | ForEach-Object { $_.Name + ' ' + $_.CPU + ' ' + $_.WorkingSet }"`,
    delay: 1000,
  }
}
const osPlatform = platform()
const osCommand = osConstants[osPlatform].command ?? osConstants.win32.command
const osDelay = osConstants[osPlatform].delay ?? osConstants.win32.delay
let lastProcessInfo = ''
let startLoggingTime = 0
let timeout: NodeJS.Timeout

const getCurrentTime = (): number => new Date().getTime()
const getSecondsFromMilliseconds = (milliseconds: number): number => milliseconds / 1000

const execProcess = (command: string): void => {
  exec(command, (error, stdout) => {
    if (error !== null) {
      console.log(`error command: ${error}`);
    }

    console.clear()
    lastProcessInfo = stdout

    console.log(stdout)
  })
}

const logData = () => {
  const logInfo = `${getCurrentTime()} : ${lastProcessInfo}`

  appendFile(LOG_FILE, logInfo, (error) => {
    if (error !== null) {
      console.error(`Error log data: ${error}`)
      console.log(`Not logged info - ${logInfo}`)
    }
  })
}

const emitProcessData = () => {
  if (getSecondsFromMilliseconds(getCurrentTime() - startLoggingTime) >= LOG_DELAY_S) {
    startLoggingTime = getCurrentTime()
    logData()
  }

  execProcess(osCommand)

  clearTimeout(timeout)
  timeout = setTimeout(() => {
    emitProcessData()
  }, osDelay)
}

startLoggingTime = getCurrentTime()
emitProcessData()
