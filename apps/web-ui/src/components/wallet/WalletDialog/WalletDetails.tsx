import { nanoid } from "@reduxjs/toolkit";
import { Flex, Text, TextField, Button, Dialog } from "@radix-ui/themes";
import { Cross1Icon } from "@radix-ui/react-icons";
import { Formik, Form, FieldArray } from "formik";
import * as yup from "yup";
import { Wallet } from "@models/Wallet";
import { Xpub } from "@models/Xpub";
import { hexToRgb, parseRgb, rgbToHex } from "@root/lib/utils";
import { useAppDispatch } from "@root/lib/hooks/store.hooks";
import { upsertWallet } from "@root/lib/slices/wallets.slice";
import { type ImportResult } from "./ImportWallet";
type WalletDetailsProps = {
  wallet?: Wallet;
  importResult?: ImportResult;
  onClose: (success: boolean) => void;
};

type WalletFields = {
  id: string;
  name: string;
  color: string;
  xpubs: string[];
};

// Create validation schema with custom xpub validation
const walletValidationSchema = yup.object().shape({
  name: yup
    .string()
    .required("Wallet name is required")
    .min(1, "Wallet name must be at least 1 character")
    .max(50, "Wallet name must be less than 50 characters"),
  color: yup
    .string()
    .required("Color is required")
    .matches(/^rgb\(\d+,\s*\d+,\s*\d+\)$/, "Color must be a valid RGB format"),
  xpubs: yup
    .array()
    .of(
      yup
        .string()
        .transform((value) =>
          typeof value === "string" ? value.trim() : value
        )
        .required("XPUB is required")
        .test("is-valid-xpub", "Invalid XPUB format", async function (value) {
          if (!value) return false;
          try {
            return await Xpub.isValidXpub(value);
          } catch {
            return false;
          }
        })
    )
    .min(1, "At least one XPUB is required")
    .required("XPUBs are required"),
});

export const WalletDetails = ({
  importResult,
  wallet,
  onClose,
}: WalletDetailsProps) => {
  const dispatch = useAppDispatch();

  const initialData = {} as WalletFields;
  if (importResult) {
    initialData.id = nanoid();
    initialData.name = importResult.name;
    initialData.color = importResult.color || "rgb(153, 204, 255)";
    initialData.xpubs = importResult.xpubs || [""];
  } else if (wallet) {
    initialData.id = wallet.id;
    initialData.name = wallet.name;
    initialData.color = wallet.color || "rgb(153, 204, 255)";
    initialData.xpubs = wallet.listXpubsStrings || [""];
  } else {
    initialData.id = nanoid();
    initialData.name = "";
    initialData.color = "rgb(153, 204, 255)";
    initialData.xpubs = [""];
  }

  const handleSubmit = async (values: WalletFields) => {
    try {
      dispatch(upsertWallet(values));
      onClose(true);
    } catch (error) {
      console.error("Failed to save wallet:", error);
    }
  };

  const handleCancel = () => {
    onClose(false);
  };

  const handleColorChange = (
    value: string,
    setFieldValue: (field: string, value: unknown) => void
  ) => {
    const rgb = hexToRgb(value);
    if (rgb !== null) {
      const color = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
      setFieldValue("color", color);
    }
  };

  const handleXpubBlur = (
    index: number,
    value: string,
    setFieldValue: (field: string, value: unknown) => void
  ) => {
    const trimmedValue = value.trim();
    setFieldValue(`xpubs.${index}`, trimmedValue);
  };

  return (
    <Formik
      initialValues={initialData}
      validationSchema={walletValidationSchema}
      onSubmit={handleSubmit}
      enableReinitialize={false}
    >
      {({
        values,
        errors,
        touched,
        setFieldValue,
        handleChange,
        handleBlur,
        isSubmitting,
        isValid,
      }) => (
        <Form>
          <Flex direction="column" gap="3">
            <label>
              <Text as="div" size="2" mb="1" weight="bold">
                Name
              </Text>
              <TextField.Root
                name="name"
                value={values.name}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter a name for this wallet (can be anything)"
              />
              {errors.name && touched.name && (
                <Text size="1" color="red" className="mt-1">
                  {String(errors.name)}
                </Text>
              )}
            </label>

            <label>
              <Text as="div" size="2" mb="1" weight="bold">
                Color
              </Text>
              <TextField.Root
                // @ts-expect-error radix-ui doesn't support color input
                type="color"
                value={rgbToHex(parseRgb(values.color))}
                onChange={(e) =>
                  handleColorChange(e.target.value, setFieldValue)
                }
              />
              {errors.color && touched.color && (
                <Text size="1" color="red" className="mt-1">
                  {String(errors.color)}
                </Text>
              )}
            </label>

            <label>
              <Text as="div" size="2" mb="1" weight="bold">
                XPUB Key
              </Text>
              <FieldArray name="xpubs">
                {({ push, remove }) => (
                  <>
                    {values.xpubs.map((xpub: string, index: number) => (
                      <div className="mb-2" key={index}>
                        <TextField.Root
                          name={`xpubs.${index}`}
                          placeholder="Enter an XPUB, YPUB, or ZPUB"
                          value={xpub}
                          onChange={handleChange}
                          onBlur={(e) => {
                            handleBlur(e);
                            handleXpubBlur(
                              index,
                              e.target.value,
                              setFieldValue
                            );
                          }}
                        >
                          {index > 0 && (
                            <TextField.Slot onClick={() => remove(index)}>
                              <Cross1Icon
                                height="16"
                                width="16"
                                className="hover:cursor-pointer"
                              />
                            </TextField.Slot>
                          )}
                        </TextField.Root>
                        {Array.isArray(errors.xpubs) &&
                          Array.isArray(touched.xpubs) &&
                          errors.xpubs[index] &&
                          touched.xpubs[index] && (
                            <Text size="1" color="red" className="mt-1">
                              {errors.xpubs[index]}
                            </Text>
                          )}
                      </div>
                    ))}
                    <div>
                      <Button
                        type="button"
                        variant="soft"
                        onClick={() => push("")}
                      >
                        Add XPub (multi-sig)
                      </Button>
                    </div>
                  </>
                )}
              </FieldArray>
            </label>
          </Flex>

          <div className="mt-2 flex justify-end">
            <Flex gap="3">
              <Dialog.Close>
                <Button
                  type="button"
                  variant="soft"
                  color="gray"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
              </Dialog.Close>
              <Dialog.Close>
                <Button type="submit" disabled={isSubmitting || !isValid}>
                  {isSubmitting ? "Saving..." : "Save"}
                </Button>
              </Dialog.Close>
            </Flex>
          </div>
        </Form>
      )}
    </Formik>
  );
};
