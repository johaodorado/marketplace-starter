import { Body, Controller, Get, Param, Patch, Req, UseGuards } from '@nestjs/common'
import { RolUsuario } from '@prisma/client'
import { Roles } from '../../common/decorators/roles.decorator'
import { JwtGuard } from '../../common/guards/jwt.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { PaymentsService } from './payments.service'
import { ReportManualPaymentDto } from './dto/report-manual-payment.dto'
import { ReviewPaymentDto } from './dto/review-payment.dto'

@Controller('payments')
@UseGuards(JwtGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('manual/:orderId')
  getManualPaymentInfo(@Req() req: any, @Param('orderId') orderId: string) {
    return this.paymentsService.getManualPaymentInfo(req.user.sub, orderId)
  }

  @Patch('manual/:orderId/report')
  reportManualPayment(
    @Req() req: any,
    @Param('orderId') orderId: string,
    @Body() dto: ReportManualPaymentDto,
  ) {
    return this.paymentsService.reportManualPayment(req.user.sub, orderId, dto)
  }

  @Get('orders/:orderId')
  getMyPayment(@Req() req: any, @Param('orderId') orderId: string) {
    return this.paymentsService.getMyPayment(req.user.sub, orderId)
  }

  @Get('admin/reported')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(RolUsuario.ADMIN)
  listReportedPayments() {
    return this.paymentsService.listReportedPayments()
  }

  @Patch('admin/:paymentId/approve')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(RolUsuario.ADMIN)
  approvePayment(
    @Param('paymentId') paymentId: string,
    @Body() dto: ReviewPaymentDto,
  ) {
    return this.paymentsService.approvePayment(paymentId, dto.observacion)
  }

  @Patch('admin/:paymentId/reject')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(RolUsuario.ADMIN)
  rejectPayment(
    @Param('paymentId') paymentId: string,
    @Body() dto: ReviewPaymentDto,
  ) {
    return this.paymentsService.rejectPayment(paymentId, dto.observacion)
  }
}