import LeadForm from "@/components/LeadForm/LeadForm";
import { Box } from "@mui/material";
import Header from "@/components/Header/Header";
import Image from "next/image";
import AlmaLogo from "@/public/images/alma-logo.svg";

export const metadata = {
  title: 'Alma - Your partner on the path to the American Dream',
  description: 'Submit your information and let us help you with your visa needs',
};

export default function HomePage() {
  return (
    <Box className="min-h-screen">
			<Header>
			<Box className="container mx-auto px-8 md:px-64 py-12 flex flex-col gap-8 md:gap-12">
				<Image src={AlmaLogo} alt="Alma Logo" width={60} />
					<h1 className="text-3xl md:text-6xl font-bold">
						Get An Assessment Of Your Immigration Case
					</h1>
				</Box>
			</Header>
			<main>
				<LeadForm />
			</main>
    </Box>
  );
} 