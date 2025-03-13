import { Box, Button } from "@mui/material";
import IconInfo from "@/public/images/icon-info.png";
import Image from "next/image";
import Header from "@/components/Header/Header";
import AlmaLogo from "@/public/images/alma-logo.svg";

export default function ThankYouPage() {
	return (
		<>
			<Box className="bg-[#d4d99b] mb-16 flex justify-center items-center py-12">
				<Image src={AlmaLogo} alt="Alma Logo" width={60} />
			</Box>
			<Box className="container mx-auto px-8 py-12 flex flex-col gap-4 text-center items-center">
				<Image src={IconInfo} alt="Info Icon" width={48} />
				<h2 className="text-3xl font-bold">Thank You</h2>
				<Box className="max-w-lg mx-auto">
				<p className="text-lg font-bold">Your information was submitted to our team of immigration attorneys. Expect an email from hello@tryalma.ai.</p>
			</Box>
				<Button className="w-full max-w-[19.375rem] normal-case py-4 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 mt-8" href="/">Back to Home</Button>
			</Box>
		</>
	);
}