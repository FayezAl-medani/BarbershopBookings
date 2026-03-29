import { Controller, Post, Body, HttpCode, HttpStatus } from "@nestjs/common";
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiInternalServerErrorResponse,
} from "@nestjs/swagger";
import { AuthService } from "./auth.service.js";
import { LoginDto } from "./dto/request/login.dto.js";
import { SendOtpDto } from "./dto/request/send-otp.dto.js";
import { VerifyOtpDto } from "./dto/request/verify-otp.dto.js";
import { RefreshTokenDto } from "./dto/request/refresh-token.dto.js";
import { AuthResponseDto } from "./dto/response/auth-response.dto.js";
import { OtpSentResponseDto } from "./dto/response/otp-sent-response.dto.js";
import { DataResponseDto } from "../common/dto/data-response.dto.js";
import {
  ErrorResponseDto,
  SuccessResponseDto,
  MessageResponseDto,
} from "../common/dto/status.dto.js";
import {
  ApiDataResponse,
  ApiMessageResponse,
} from "../common/decorators/response.decorator.js";
import { Public } from "../common/decorators/public.decorator.js";
import { BearerToken } from "../common/decorators/bearer-token.decorator.js";

@ApiInternalServerErrorResponse({ type: ErrorResponseDto })
@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("admin/login")
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Admin login with email and password" })
  @ApiDataResponse(AuthResponseDto)
  async adminLogin(
    @Body() payload: LoginDto,
  ): Promise<DataResponseDto<AuthResponseDto>> {
    const result = await this.authService.adminLogin(
      payload.email,
      payload.password,
    );
    return new DataResponseDto(result);
  }

  @Post("owner/login")
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Barbershop owner login with email and password" })
  @ApiDataResponse(AuthResponseDto)
  async ownerLogin(
    @Body() payload: LoginDto,
  ): Promise<DataResponseDto<AuthResponseDto>> {
    const result = await this.authService.ownerLogin(
      payload.email,
      payload.password,
    );
    return new DataResponseDto(result);
  }

  @Post("send-otp")
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Send OTP to phone number" })
  @ApiDataResponse(OtpSentResponseDto)
  async sendOtp(
    @Body() payload: SendOtpDto,
  ): Promise<DataResponseDto<OtpSentResponseDto>> {
    const result = await this.authService.sendOtp(payload.phoneNumber);
    return new DataResponseDto(result);
  }

  @Post("verify-otp")
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Verify OTP and login (auto-registers customer if new)",
  })
  @ApiDataResponse(AuthResponseDto)
  async verifyOtp(
    @Body() payload: VerifyOtpDto,
  ): Promise<DataResponseDto<AuthResponseDto>> {
    const result = await this.authService.verifyOtpAndLogin(
      payload.phoneNumber,
      payload.otp,
    );
    return new DataResponseDto(result);
  }

  @Post("refresh")
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Refresh access token" })
  @ApiDataResponse(AuthResponseDto)
  async refresh(
    @Body() payload: RefreshTokenDto,
  ): Promise<DataResponseDto<AuthResponseDto>> {
    const result = await this.authService.refreshToken(payload.refreshToken);
    return new DataResponseDto(result);
  }

  @Post("logout")
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth("access-token")
  @ApiMessageResponse()
  @ApiOperation({ summary: "Logout and invalidate token" })
  async logout(
    @BearerToken() accessToken: string,
  ): Promise<MessageResponseDto> {
    await this.authService.logout(accessToken);
    return new SuccessResponseDto("Logged out successfully");
  }
}
