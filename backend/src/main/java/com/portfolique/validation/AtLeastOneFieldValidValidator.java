package com.portfolique.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import java.lang.reflect.Field;

public class AtLeastOneFieldValidValidator
    implements ConstraintValidator<AtLeastOneFieldValid, Object> {

  @Override
  public boolean isValid(Object value, ConstraintValidatorContext context) {
    if (value == null) return false;

    Field[] fields = value.getClass().getDeclaredFields();
    for (Field field : fields) {
      if (field.getType().equals(String.class)) {
        try {
          field.setAccessible(true);
          String fieldValue = (String) field.get(value);
          if (fieldValue != null && fieldValue.trim().length() >= 20) {
            return true;
          }
        } catch (IllegalAccessException e) {
          // Ignore or log
        }
      }
    }
    return false;
  }
}
