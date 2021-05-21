import { EntitySubscriberInterface, EventSubscriber, InsertEvent, UpdateEvent } from 'typeorm'
import { validate } from 'class-validator'

@EventSubscriber()
export class ValidationSubscriber implements EntitySubscriberInterface {
  async beforeInsert (event: InsertEvent<any>): Promise<void> {
    const errors = await validate(event.entity)
    if (errors.length > 0) {
      throw new Error(errors[0].toString())
    }
  }

  async beforeUpdate (event: UpdateEvent<any>): Promise<void> {
    const errors = await validate(event.entity)
    if (errors.length > 0) {
      throw new Error(errors[0].toString())
    }
  }
}
