'use client';

import { Box, Button, Link, Avatar, Tooltip } from "@mui/material";
import Image from "next/image";
import AlmaLogo from "@/public/images/alma-logo.svg";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

export default function AdminSidebar() {
	const pathname = usePathname();
	const session = useSession();

	return (
		<Box className="flex flex-col gap-4 px-8 py-12 border-r-2 border-gray-200 h-screen w-[20%] min-w-fit justify-between">
			<Box>
				<Image src={AlmaLogo} alt="Alma Logo" width={60} />
				<Box className="flex flex-col gap-4 mt-8">
					<Link className={`text-sm no-underline text-black text-xl ${pathname === '/dashboard' ? 'font-bold' : ''}`} href="/dashboard">Leads</Link>
					<Link className={`text-sm no-underline text-black text-xl ${pathname === '/dashboard/settings' ? 'font-bold' : ''}`} href="/dashboard/settings">Settings</Link>
				</Box>
			</Box>
			<Box className="flex flex-col gap-2 mt-8">
				<Tooltip
					title="Click to logout"
					placement="top"
					arrow
					slotProps={{
						popper: {
							modifiers: [
								{
									name: 'offset',
									options: {
										offset: [0, -10],
									},
								},
								],
							},
						}}
					>
					<Button className="flex flex-row gap-2 bg-transparent normal-case text-black justify-start" onClick={() => signOut()}>
						<Avatar className="text-black">{session?.data?.user?.name?.charAt(0)}</Avatar>{session?.data?.user?.name}
					</Button>
				</Tooltip>
			</Box>
		</Box>
	);
}