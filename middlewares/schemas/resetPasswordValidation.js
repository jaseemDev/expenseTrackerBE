import * as yup from "yup";
const resetPasswordValidationSchema = yup.object().shape({
  email: yup
    .string()
    .trim()
    .lowercase()
    .email("Invalid email")
    .required("Email is required"),
});
export default resetPasswordValidationSchema;
