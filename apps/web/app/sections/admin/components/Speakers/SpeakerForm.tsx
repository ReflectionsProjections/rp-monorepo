import { useMirrorStyles } from "@app/sections/admin/styles/Mirror";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  FormErrorMessage,
  VStack,
  useColorModeValue
} from "@chakra-ui/react";
import type { FormikHelpers } from "formik";
import { Formik } from "formik";
import type { SpeakerFormValues } from "./SpeakerSchema";
import { SpeakerFormInitialValues, SpeakerFormSchema } from "./SpeakerSchema";

const SPEAKER_IMAGE_OPTIONS = [
  ["Alaknantha Suresh", "alaknantha_suresh.JPG"],
  ["Anup Warrier", "anup_warrier.jpg"],
  ["Dakarai Crowder", "dakarai_crowder.jpg"],
  ["Jacqueline Yau", "jacqueline_yau.jpg"],
  ["Maru Nimit", "maru_nimit.jpg"],
  ["Michael Schrenk", "michael_schrenk.png"],
  ["Michael Stopa", "michael_stopa.jpeg"],
  ["Moshe Mahler", "moshe_mahler.jpg"],
  ["Nate Gross", "nate_gross.jpg"],
  ["Philip Su", "philip_su.jpg"],
  ["Suresh Poopandi", "suresh_poopandi.png"],
  ["Tamanna Sait", "tamanna_sait.jpg"]
] as const;

interface SpeakerFormProps {
  initialValues?: SpeakerFormValues;
  onSubmit: (
    values: SpeakerFormValues,
    helpers: FormikHelpers<SpeakerFormValues>
  ) => void;
  onCancel: () => void;
  title: string;
  submitText: string;
  isOpen: boolean;
  onClose: () => void;
}

const SpeakerForm: React.FC<SpeakerFormProps> = ({
  initialValues = SpeakerFormInitialValues,
  onSubmit,
  onCancel,
  title,
  submitText,
  isOpen,
  onClose
}) => {
  const mirrorStyles = useMirrorStyles();
  const modalBg = useColorModeValue("white", "gray.800");

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent sx={mirrorStyles} bg={modalBg} color="white">
        <Formik<SpeakerFormValues>
          initialValues={initialValues}
          validationSchema={SpeakerFormSchema}
          onSubmit={onSubmit}
        >
          {({
            values,
            handleChange,
            handleSubmit,
            isSubmitting,
            errors,
            touched,
            setFieldValue
          }) => (
            <form onSubmit={handleSubmit}>
              <ModalHeader>{title}</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <VStack spacing={4}>
                  <FormControl
                    isRequired
                    isInvalid={!!errors.name && touched.name}
                  >
                    <FormLabel>Name</FormLabel>
                    <Input
                      name="name"
                      value={values.name}
                      onChange={handleChange}
                      placeholder="Enter speaker name"
                    />
                    <FormErrorMessage>{errors.name}</FormErrorMessage>
                  </FormControl>

                  <FormControl
                    isRequired
                    isInvalid={!!errors.title && touched.title}
                  >
                    <FormLabel>Title</FormLabel>
                    <Input
                      name="title"
                      value={values.title}
                      onChange={handleChange}
                      placeholder="Enter speaker title"
                    />
                    <FormErrorMessage>{errors.title}</FormErrorMessage>
                  </FormControl>

                  <FormControl
                    isRequired
                    isInvalid={!!errors.bio && touched.bio}
                  >
                    <FormLabel>Bio</FormLabel>
                    <Textarea
                      name="bio"
                      value={values.bio}
                      onChange={handleChange}
                      placeholder="Enter speaker bio"
                      rows={4}
                    />
                    <FormErrorMessage>{errors.bio}</FormErrorMessage>
                  </FormControl>

                  <FormControl isInvalid={!!errors.imgUrl && touched.imgUrl}>
                    <FormLabel>Image</FormLabel>
                    <Select
                      mb={2}
                      placeholder="Choose a 2026 speaker image"
                      value={
                        values.imgUrl.startsWith("/site/speakers-2026/")
                          ? values.imgUrl
                          : ""
                      }
                      onChange={(event) => {
                        void setFieldValue("imgUrl", event.target.value);
                      }}
                    >
                      {SPEAKER_IMAGE_OPTIONS.map(([label, filename]) => {
                        const imagePath = `/site/speakers-2026/${filename}`;
                        return (
                          <option key={filename} value={imagePath}>
                            {label}
                          </option>
                        );
                      })}
                    </Select>
                    <Input
                      name="imgUrl"
                      value={values.imgUrl}
                      onChange={handleChange}
                      placeholder="Or enter a full image URL"
                    />
                    <FormErrorMessage>{errors.imgUrl}</FormErrorMessage>
                  </FormControl>
                </VStack>
              </ModalBody>

              <ModalFooter>
                <Button variant="ghost" color="white" mr={3} onClick={onCancel}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  isLoading={isSubmitting}
                  loadingText={submitText}
                >
                  {submitText}
                </Button>
              </ModalFooter>
            </form>
          )}
        </Formik>
      </ModalContent>
    </Modal>
  );
};

export default SpeakerForm;
