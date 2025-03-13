'use client';

import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Button } from '@mui/material';
import CountryInput from '../Inputs/CountryInput/CountryInput';
import TextInput from '../Inputs/TextInput/TextInput';
import CheckboxInput from '../Inputs/Checkbox/Checkbox';
import IconInfo from '@/public/images/icon-info.png';
import DiceIcon from '@/public/images/icon-dice.png';
import HeartIcon from '@/public/images/icon-heart.png';
import Image from 'next/image';

// Define the form data type
interface LeadFormData {
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  website: string;
  message: string;
	visaCategoryO1: boolean;
	visaCategoryEB1A: boolean;
	visaCategoryEB2NIW: boolean;
	visaCategoryUnknown: boolean;
	files?: FileList;
}

export default function LeadForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [serverError, setServerError] = useState<string>('');
  
  // Initialize react-hook-form
  const {
    handleSubmit,
    watch,
		control
  } = useForm<LeadFormData>({
    mode: 'onTouched', // This makes validation run when fields are blurred
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      country: '',
      website: '',
      message: '',
      visaCategoryO1: false,
      visaCategoryEB1A: false,
      visaCategoryEB2NIW: false,
      visaCategoryUnknown: false
    }
  });
  
  // Watch all form values to determine if fields have content
  const watchedValues = watch();
  
  const onSubmit: SubmitHandler<LeadFormData> = async (data) => {
    setIsSubmitting(true);
    setServerError('');
    
    try {
      const formPayload = new FormData();
      
      // Add all form fields to FormData
      Object.entries(data).forEach(([key, value]) => {
        // Skip files field, we'll handle it separately
        if (key === 'files') return;
        
        // Convert boolean values to strings for FormData
        if (typeof value === 'boolean') {
          formPayload.append(key, value.toString());
        } else if (value !== undefined && value !== null) {
          formPayload.append(key, value as string);
        }
      });
      
      // Add each file individually
      if (data.files) {
        for (let i = 0; i < data.files.length; i++) {
          formPayload.append('files', data.files[i]);
        }
      }
      
      const response = await fetch('/api/leads', {
        method: 'POST',
        body: formPayload,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit lead information');
      }
      
      // Redirect to thank you page
      router.push('/thank-you');
      
    } catch (err) {
      setServerError((err as Error).message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };  
  
  return (
    <Box className="max-w-2xl mx-auto">
      <Box className="container text-center mx-auto px-4 py-12 max-w-[40rem] flex flex-col items-center gap-4">
				<Image src={IconInfo} alt="Info Icon" width={60} />
				<h2 className="text-2xl font-bold">Want to understand your visa options?</h2>
				<p className="text-lg font-medium">Submit the form below and our team of experienced attorneys will review your information and send a preliminary assessment of your case based on your goals.</p>
			</Box>
      
      {serverError && (
        <Box className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded">
          {serverError}
        </Box>
      )}

			<Box className="container mx-auto px-4 py-12 max-w-[30rem]">      
				<form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
					<Box>
						<Controller
							control={control}
							name="firstName"
							rules={{ required: "First Name is required" }}
							render={({ field, fieldState }) => (
								<>
									<TextInput
										id="firstName"
										label="First Name"
										{...field}
										onBlur={() => field.onBlur()}
									/>
									{fieldState.error && (
										<p className="mt-1 text-sm text-red-600">{fieldState.error.message}</p>
									)}
								</>
							)}
						/>
					</Box>

					<Box>
						<Controller
							control={control}
							name="lastName"
							rules={{ required: "Last Name is required" }}
							render={({ field, fieldState }) => (
								<>
									<TextInput
										id="lastName"
										label="Last Name"
										{...field}
										onBlur={() => field.onBlur()}
									/>
									{fieldState.error && (
										<p className="mt-1 text-sm text-red-600">{fieldState.error.message}</p>
									)}
								</>
							)}
						/>
					</Box>

					<Box>
						<Controller
							control={control}
							name="email"
							rules={{
								required: "Email is required",
								pattern: {
									value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
									message: "Invalid email address"
								}
							}}
							render={({ field, fieldState }) => (
								<>
									<TextInput
										id="email"
										label="Email"
										{...field}
										onBlur={() => field.onBlur()}
									/>
									{fieldState.error && (
										<p className="mt-1 text-sm text-red-600">{fieldState.error.message}</p>
									)}
								</>
							)}
						/>
					</Box>

					<Box>
						<Controller
							control={control}
							name="country"
							render={({ field }) => (
								<CountryInput {...field} />
							)}
						/>
					</Box>

					<Box>
						<Controller
							control={control}
							name="website"
							rules={{
								required: "LinkedIn / Personal Website URL is required",
								pattern: {
									value: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
									message: "Please enter a valid URL"
								}
							}}
							render={({ field, fieldState }) => (
								<>
									<TextInput
										id="website"
										label="LinkedIn / Personal Website URL"
										{...field}
										onBlur={() => field.onBlur()}
									/>
									{fieldState.error && (
										<p className="mt-1 text-sm text-red-600">{fieldState.error.message}</p>
									)}
								</>
							)}
						/>
					</Box>

					<Box>
						<Controller
							control={control}
							name="files"
							render={({ field }) => (
								<Box className="flex flex-col gap-2">
									<Button
										component="label"
										role="button"
										tabIndex={-1}
										className="normal-case py-4 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 mt-8"
									>
										Resume / CV
										<input
											type="file"
											hidden
											multiple
											onChange={(event) => {
												field.onChange(event.target.files);
											}}
										/>
									</Button>
									{field.value && (
										<p className="mt-1 text-sm text-gray-600">{field.value.length} files selected <Button variant="text" size="small" onClick={() => field.onChange(null)}>Clear</Button></p>
									)}
								</Box>
							)}
						/>
					</Box>
					<Box className="flex flex-col items-center gap-4 mt-8">
						<Image src={DiceIcon} alt="Dice Icon" width={60} />
						<h2 className="text-2xl font-bold mb-4">Visa categories of interest?</h2>
					</Box>

					<Box className="flex flex-col gap-1">
						<CheckboxInput name="visaCategoryO1" control={control} label="O-1" />
						<CheckboxInput name="visaCategoryEB1A" control={control} label="EB-1A" />
						<CheckboxInput name="visaCategoryEB2NIW" control={control} label="EB-2 NIW" />
						<CheckboxInput name="visaCategoryUnknown" control={control} label="I don't know" />
					</Box>

					<Box className="flex flex-col items-center gap-4 mt-8">
						<Image src={HeartIcon} alt="Heart Icon" width={60} />
						<h2 className="text-2xl font-bold mb-4">How can we help you?</h2>
					</Box>

					<Box>
						<Controller
							control={control}
							name="message"
							render={({ field }) => (
								<TextInput
									id="message"
									multiline
									minRows={6}
									placeholder="What is your current status and when does it expire? What is your past immigration history? Are you looking for long-term permanent residency or short-term employment visa or both? Are there any timeline considerations?"
									{...field}
								/>
							)}
						/>
					</Box>

					<Box>
						<Button
							type="submit"
							disabled={isSubmitting}
							className="w-full flex justify-center normal-case py-4 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 mt-8"
						>
							{isSubmitting ? 'Submitting...' : 'Submit'}
						</Button>
					</Box>
				</form>
			</Box>
    </Box>
  );
} 