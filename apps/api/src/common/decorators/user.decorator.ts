import { createParamDecorator, ExecutionContext } from '@nestjs/common'

export type JwtUser = {
  sub: string
  email: string
  rol: string
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtUser | undefined => {
    const request = ctx.switchToHttp().getRequest<{ user?: JwtUser }>()
    return request.user
  }
)
