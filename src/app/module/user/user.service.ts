import bcrypt from "bcrypt";
import { prisma } from "../../lib/prisma";
import { UserRole, UserStatus } from "../../../generated/prisma/enums";
import { IUpdateProfile } from "./user.interface";
import status from "http-status";
import AppError from "../../errorHelpers/AppError";

const changeRole = async (id: string) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      id,
    },
  });

  if (user.role === UserRole.USER) {
    const result = await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        role: UserRole.ADMIN,
      },
    });

    const { password: userPassword, ...safeUser } = result;

    return safeUser;
  }

  if (user.role === UserRole.ADMIN) {
    const result = await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        role: UserRole.USER,
      },
    });

    const { password: userPassword, ...safeUser } = result;

    return safeUser;
  }
};

const getAllUsers = async () => {
  const users = await prisma.user.findMany({
    where: {
      status: UserStatus.ACTIVE,
    },
  });

  return users.map((user) => {
    const { password: userPassword, ...safeUser } = user;
    return safeUser;
  });
};

const getUserById = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id,
    },
  });

  if (!user) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  if (user.status !== UserStatus.ACTIVE) {
    throw new AppError(status.FORBIDDEN, "User is not active");
  }

  const { password: userPassword, ...safeUser } = user;

  return safeUser;
};

const updateProfile = async (id: string, payload: IUpdateProfile) => {
  const user = await prisma.user.update({
    where: {
      id,
    },
    data: payload,
  });

  if (!user) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  const { password: userPassword, ...safeUser } = user;

  return safeUser;
};

const updateStatus = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id,
    },
  });

  if (!user) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  if (user.role === UserRole.ADMIN) {
    throw new AppError(status.FORBIDDEN, "Admin cannot be banned");
  }

  const newStatus =
    user.status === UserStatus.ACTIVE ? UserStatus.BANNED : UserStatus.ACTIVE;

  const result = await prisma.user.update({
    where: {
      id,
    },
    data: {
      status: newStatus,
    },
  });

  const { password: userPassword, ...safeUser } = result;

  return safeUser;
};

const getMyProfile = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id,
    },
    include: {
      eventParticipations: true,
      events: true,
    },
  });

  if (!user) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  const { password: userPassword, ...safeUser } = user;

  return safeUser;
};

export const UserService = {
  changeRole,
  getAllUsers,
  getUserById,
  updateProfile,
  updateStatus,
  getMyProfile,
};
