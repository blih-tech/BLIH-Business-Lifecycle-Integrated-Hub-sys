import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../platform/prisma/prisma.service';
import type { ContractResponseDto } from './contracts.dto';
import { mapContract } from './create-contract.usecase';

@Injectable()
export class SignContractUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    contractId: string,
    userId: string,
  ): Promise<ContractResponseDto> {
    const contract = await this.prisma.contract.findUnique({
      where: { id: contractId },
      include: { signers: true },
    });

    if (!contract) {
      throw new NotFoundException('Contract not found');
    }

    const signer = contract.signers.find((s) => s.userId === userId);
    if (!signer) {
      throw new BadRequestException(
        'You are not a designated signer for this contract',
      );
    }

    if (signer.hasSigned) {
      throw new BadRequestException('You have already signed this contract');
    }

    // Update signer status
    await this.prisma.contractSigner.update({
      where: { id: signer.id },
      data: {
        hasSigned: true,
        signedAt: new Date(),
      },
    });

    // Re-fetch contract to return updated data
    const updated = await this.prisma.contract.findUniqueOrThrow({
      where: { id: contractId },
      include: {
        template: true,
        signers: {
          include: {
            user: {
              include: {
                employee: {
                  include: {
                    profile: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return mapContract(updated);
  }
}
