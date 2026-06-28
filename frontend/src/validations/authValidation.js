export const validateSignup = (formData) => {
    let errors = {};

    if (!formData.name?.trim()) {
        errors.name = "الاسم مطلوب";
    } else if (formData.name.length < 2 || formData.name.length > 80) {
        errors.name = "يجب أن يكون الاسم بين 2 إلى 80 حرفاً";
    }

    const emailRegex = /\S+@\S+\.\S+/;
    if (!formData.email) {
        errors.email = "البريد الإلكتروني مطلوب";
    } else if (!emailRegex.test(formData.email)) {
        errors.email = "صيغة البريد الإلكتروني غير صحيحة";
    }

    const phoneRegex = /^(059|056)\d{7}$/; 
    if (!formData.phone) {
        errors.phone = "رقم الهاتف مطلوب";
    } else if (!phoneRegex.test(formData.phone)) {
        errors.phone = "يجب إدخال رقم هاتف فلسطيني صحيح (مثلاً 059xxxxxxx)";
    }

    if (!formData.password) {
        errors.password = "كلمة السر مطلوبة";
    }

    if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = "كلمة السر غير متطابقة";
    }

    return errors;
};

export const validateLogin = (formData) => {
    let errors = {};

    if (!formData.email) {
        errors.email = "البريد الإلكتروني مطلوب";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        errors.email = "صيغة البريد الإلكتروني غير صحيحة";
    }

    if (!formData.password) {
        errors.password = "كلمة المرور مطلوبة";
    }

    return errors;
};

export const validateForgotPassword = (formData) => {
    let errors = {};

    if (!formData.email) {
        errors.email = "البريد الإلكتروني مطلوب لإرسال كود التحقق";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        errors.email = "صيغة البريد الإلكتروني غير صحيحة، يرجى التأكد منه";
    }

    return errors;
};

export const validateResetPassword = (formData) => {
    let errors = {};

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

    if (!formData.newPassword) {
        errors.newPassword = "كلمة المرور الجديدة مطلوبة";
    } else if (!passwordRegex.test(formData.newPassword)) {
        errors.newPassword = "يجب أن تكون 8 أحرف على الأقل، وتحتوي على حرف كبير ورقم";
    }

    if (!formData.confirmPassword) {
        errors.confirmPassword = "يرجى تأكيد كلمة المرور";
    } else if (formData.confirmPassword !== formData.newPassword) {
        errors.confirmPassword = "كلمات المرور غير متطابقة!";
    }

    return errors;
};

export const validateUpdateProfile = (formData) => {
    let errors = {};

    // التحقق من الاسم
    if (!formData.name?.trim()) {
        errors.name = "الاسم مطلوب";
    } else if (formData.name.length < 2 || formData.name.length > 80) {
        errors.name = "يجب أن يكون الاسم بين 2 إلى 80 حرفاً";
    }

    const phoneRegex = /^(059|056)\d{7}$/; 
    if (!formData.phone) {
        errors.phone = "رقم الهاتف مطلوب";
    } else if (!phoneRegex.test(formData.phone)) {
        errors.phone = "يجب إدخال رقم هاتف فلسطيني صحيح (059xxxxxxx أو 056xxxxxxx)";
    }

    return errors;
};

export const validateUpdatePassword = (formData) => {
    let errors = {};
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

    if (!formData.currentPassword) {
        errors.currentPassword = "كلمة المرور الحالية مطلوبة";
    }

    if (!formData.newPassword) {
        errors.newPassword = "كلمة المرور الجديدة مطلوبة";
    } else if (!passwordRegex.test(formData.newPassword)) {
        errors.newPassword = "يجب أن تكون 8 أحرف على الأقل، وتحتوي على حرف كبير ورقم";
    }

    if (!formData.confirmPassword) {
        errors.confirmPassword = "يرجى تأكيد كلمة المرور الجديدة";
    } else if (formData.confirmPassword !== formData.newPassword) {
        errors.confirmPassword = "كلمات المرور غير متطابقة";
    }

    return errors;
};