import envVars from "../../config/env";
import { UserRole, UserStatus } from "../../generated/prisma/client";
import { prisma } from "../lib/prisma";
import bcrypt from "bcrypt";

export const seedAdmin = async () => {
    try {
        const adminEmail = envVars.ADMIN_EMAIL;
        const adminPassword = envVars.ADMIN_PASSWORD;
        
        // Check if admin already exists
        const existingAdmin = await prisma.user.findUnique({
            where: {
                email: adminEmail,
            },
        });

        if (existingAdmin) {
            console.log("Admin user already exists.");
            return;
        }

        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        const admin = await prisma.user.create({
            data: {
                firstName: "Super",
                lastName: "Admin",
                email: adminEmail,
                password: hashedPassword,
                role: UserRole.ADMIN,
            },
        });
        console.log("Admin seeded successfully:", admin.email);
    } catch (error) {
        console.error("Error seeding admin:", error);
    }
};


seedAdmin().catch((error) => {
    console.error("Error seeding admin:", error);
    process.exit(1);
}).finally(async () => {
    await prisma.$disconnect();
});

