import { Argument, ArgumentType, CommandoMessage } from 'discord.js-commando'
import { MessageMentions } from 'discord.js'
import { getDateInfo } from './time'

type Validator =
(this: ArgumentType, val: string, msg: CommandoMessage, arg: Argument) => boolean | string | Promise<boolean | string>
// A test returning true means the validation failed.
type ValidatorTest =
((this: ArgumentType, val: string, msg: CommandoMessage, arg: Argument) => boolean | Promise<boolean>) |
((this: ArgumentType, val: string, msg?: CommandoMessage, arg?: Argument) => boolean | Promise<boolean>)

const dateRegex = /(([0-2]?[0-9]|3[0-1])[-](0?[1-9]|1[0-2])[-][0-9]{4})/
const timeRegex = /^(2[0-3]|[0-1]?[\d]):[0-5][\d]$/
const urlRegex = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi

export function validators (steps: Array<Validator | Validator[]> = []):
((val: string, msg: CommandoMessage) => Promise<boolean | string>) | undefined {
  if (steps.length === 0) {
    return
  }
  return async function (this: Argument, val, msg) {
    const valid = await this.type.validate(val, msg, this)
    if (valid === false || typeof valid === 'string') {
      return valid
    }

    for (const step of steps) {
      if (step instanceof Array) {
        const validations = step.map(validator => validator.call(this.type, val, msg, this))
        const results = await Promise.allSettled(validations)
        if (results.some(result => result.status === 'fulfilled' && result.value === true)) {
          continue
        }

        const errors = results
          .filter(result => result.status === 'fulfilled' && typeof result.value === 'string')
          .map(result => (result as PromiseFulfilledResult<string>).value)
        if (errors.length > 0) {
          return errors.join('\n')
        }
        throw (results.find(result => result.status === 'rejected') as PromiseRejectedResult).reason
      } else {
        const valid = await step.call(this.type, val, msg, this)
        if (valid === false || typeof valid === 'string') {
          return valid
        }
      }
    }
    return true
  }
}

function makeValidator (
  test: ValidatorTest,
  message: string
): Validator {
  return async function (this: ArgumentType, val, msg, arg) {
    return !(await test.call(this, val, msg, arg)) || `\`${arg.label ?? msg}\` ${message}.`
  }
}

export const noChannels = makeValidator(
  (val: string) => MessageMentions.CHANNELS_PATTERN.test(val),
  'cannot contain channels'
)

export const noNumber = makeValidator((val: string) => !isNaN(parseInt(val)), 'cannot be a number')

export const noSpaces = makeValidator((val: string) => val.includes(' '), 'cannot contain spaces')

export const noUrls = makeValidator((val: string) => urlRegex.test(val), 'cannot contain URLs')

export const isObject = makeValidator(
  (val: string) => {
    try {
      return Object.prototype.toString.call(JSON.parse(val)) !== '[object Object]'
    } catch {
      return false
    }
  },
  'must be an object'
)

export const noTags = makeValidator(
  (val: string) => (
    MessageMentions.EVERYONE_PATTERN.test(val) || MessageMentions.USERS_PATTERN.test(val) || MessageMentions
      .ROLES_PATTERN.test(val)
  ),
  'cannot contain tags'
)

export function typeOf (type: string): Validator {
  return makeValidator(
    async function (this: ArgumentType, val: string, msg: CommandoMessage, arg: Argument) {
      return typeof await this.parse(val, msg, arg) === type // eslint-disable-line valid-typeof
    },
    `must be a ${type}`
  )
}

export function validDate (dateString: string): boolean {
  if (dateRegex.test(dateString)) {
    const { day, month, year } = getDateInfo(dateString)
    const leapYear = year % 4 === 0
    if (month === 0 || month === 2 || month === 4 || month === 6 || month === 7 || month === 9 || month === 11) {
      return day <= 31
    } else if (month === 3 || month === 5 || month === 8 || month === 10) {
      return day <= 30
    } else if (month === 1) {
      return leapYear ? day <= 29 : day <= 28
    }
  }
  return false
}

export function validTime (timeString: string): boolean {
  return timeRegex.test(timeString)
}

export function validateNoneOrType (
  this: Argument,
  val: string,
  msg: CommandoMessage,
  arg: Argument
): boolean | string | Promise<boolean | string> {
  return val === 'none' || this.type.validate(val, msg, arg)
}

export function parseNoneOrType (this: Argument, val: string, msg: CommandoMessage, arg: Argument): any | Promise<any> {
  return val === 'none' ? undefined : this.type.parse(val, msg, arg)
}
