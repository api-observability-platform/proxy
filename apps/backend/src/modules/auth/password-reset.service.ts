import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { EmailService } from "../../core/email/email.service";
import { PrismaService } from "../../core/prisma/prisma.service";
import { authConstants } from "./auth.constants";
import { generateSixDigitCode } from "./utils/auth-code.util";

@Injectable()
export class PasswordResetService {
	constructor(
		@Inject(PrismaService) private readonly prismaService: PrismaService,
		@Inject(EmailService) private readonly emailService: EmailService,
	) {}

	async forgotPassword(email: string): Promise<{ message: string }> {
		const user = await this.prismaService.user.findUnique({
			where: { email },
		});
		if (!user) {
			return { message: "If an account exists, a reset code was sent." };
		}
		const plainCode = generateSixDigitCode();
		const passwordResetCodeHash = await bcrypt.hash(
			plainCode,
			authConstants.crypto.saltRounds,
		);
		await this.prismaService.user.update({
			where: { id: user.id },
			data: {
				passwordResetCodeHash,
				passwordResetExpiresAt: new Date(
					Date.now() + authConstants.crypto.codeTtlMs,
				),
			},
		});
		await this.emailService.sendPasswordResetCode(email, plainCode);
		return { message: "If an account exists, a reset code was sent." };
	}

	async resetPassword(
		email: string,
		code: string,
		newPassword: string,
	): Promise<{ message: string }> {
		const user = await this.prismaService.user.findUnique({
			where: { email },
		});
		if (
			!user?.passwordResetCodeHash ||
			!user.passwordResetExpiresAt ||
			user.passwordResetExpiresAt < new Date()
		) {
			throw new UnauthorizedException("Invalid or expired reset code");
		}
		const codeMatched = await bcrypt.compare(code, user.passwordResetCodeHash);
		if (!codeMatched) {
			throw new UnauthorizedException("Invalid or expired reset code");
		}
		const passwordHash = await bcrypt.hash(
			newPassword,
			authConstants.crypto.saltRounds,
		);
		await this.prismaService.$transaction([
			this.prismaService.user.update({
				where: { id: user.id },
				data: {
					passwordHash,
					passwordResetCodeHash: null,
					passwordResetExpiresAt: null,
				},
			}),
			this.prismaService.refreshToken.updateMany({
				where: { userId: user.id },
				data: { isRevoked: true },
			}),
		]);
		return { message: "Password has been reset. You can sign in now." };
	}
}
