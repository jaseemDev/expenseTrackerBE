import yup from "yup";

const registerUserSchema = yup.object().shape({
  name: yup
    .string()
    .required("Name is required")
    .min(3, "Name should be atleast 3 characters long!")
    .max(24, "Name should not exceed 24 characters!"),
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup
    .string()
    .required("Password is required")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),

  phone: yup.string().required("Phone number is required"),
  country: yup.string().required("Country is required"),
  nationalId: yup.string().required("National ID is required"),
  defaultCurrency: yup.string().required("Default currency is required"),
});
export default registerUserSchema;
