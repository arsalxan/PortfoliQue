package com.portfolique.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.*;

@Target({ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = AtLeastOneFieldValidValidator.class)
@Documented
public @interface AtLeastOneFieldValid {
  String message() default "At least one feedback field must be at least 20 characters long.";

  Class<?>[] groups() default {};

  Class<? extends Payload>[] payload() default {};
}
