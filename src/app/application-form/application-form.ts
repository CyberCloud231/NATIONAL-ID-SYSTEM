import { Component, OnDestroy, signal, computed, TrackByFunction } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormControl,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

/* Angular Material */
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

/* ✅ DIALOG COMPONENTS */
import { DeclarationDialogComponent } from '../Delclaration-Dialog/DeclarationDialog.component';
import { SubmissionSuccessDialog } from '../Submission-Dialog/SubmissionDialog.component';



/** Types */
type ApplicationType = 'L1' | 'L2' | 'Y1' | 'F1'; // ✅ Added F1

type PersonalInfoGroup = {
  surname: FormControl<string>;
  givenNames: FormControl<string>;
  dateOfBirth: FormControl<Date | null>;
  gender: FormControl<string>;

  // ✅ Added (since HTML uses them)
  phone: FormControl<string>;
  email: FormControl<string>;
};

type PlaceOfBirthGroup = {
  city: FormControl<string>;
  county: FormControl<string>;
  country: FormControl<string>;
};

type PassportInfoGroup = {
  passportNumber: FormControl<string>;
  issueDate: FormControl<Date | null>;
  expiryDate: FormControl<Date | null>;
  issuePlace: FormControl<string>;
};

type GuardianInfoGroup = {
  guardianFullName: FormControl<string>;
  relationship: FormControl<string>;
  guardianPhone: FormControl<string>;
};

type NationalityCategory = 'ECOWAS' | 'NON_ECOWAS';
// ✅ Added Foreign step group (since HTML uses it)
type ForeignInfoGroup = {
  nationalityCategory: FormControl<NationalityCategory | null>;
  nationality: FormControl<string>;

  passportNumber: FormControl<string>;
  passportIssueDate: FormControl<Date | null>;
  passportExpiryDate: FormControl<Date | null>;
  visaNumber: FormControl<string>;
  residencePermitNumber: FormControl<string>;
  employerInstitution: FormControl<string>;
  durationOfStay: FormControl<string>;
  currentAddressLiberia: FormControl<string>;
  permanentAddressHome: FormControl<string>;
};


type DocumentsGroup = {
  photo: FormControl<File | null>;
  birthCertificate: FormControl<File | null>;
  passportCopy: FormControl<File | null>;
  addressProof: FormControl<File | null>;

  // ✅ Added to match HTML "permitProof"
  permitProof: FormControl<File | null>;
};

type ApplicationGroup = {
  applicationType: FormControl<ApplicationType>;
};

type ApplicationFormModel = {
  application: FormGroup<ApplicationGroup>;
  personalInfo: FormGroup<PersonalInfoGroup>;
  placeOfBirth: FormGroup<PlaceOfBirthGroup>;
  passportInfo: FormGroup<PassportInfoGroup>;
  guardianInfo: FormGroup<GuardianInfoGroup>;
  foreignInfo: FormGroup<ForeignInfoGroup>; // ✅ Added
  documents: FormGroup<DocumentsGroup>;
};

@Component({
  selector: 'app-application-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatNativeDateModule,
    MatDatepickerModule,
    MatDialogModule,
  ],
  templateUrl: './application-form.html',
  styleUrls: ['./application-form.css'],
})
export class ApplicationForm implements OnDestroy {

  readonly countries = ['Liberia', 'Ghana', 'Nigeria', 'USA', 'UK', 'Canada'];
  readonly MAX_PHOTO_SIZE = 2 * 1024 * 1024; // 2MB
  readonly MAX_DOC_SIZE = 5 * 1024 * 1024;   // 5MB
  readonly ecowasCountries: string[] = [
  'Benin', 'Burkina Faso', 'Cabo Verde', "Côte d’Ivoire", 'The Gambia',
  'Ghana', 'Guinea', 'Guinea-Bissau', 'Liberia', 'Mali', 'Niger',
  'Nigeria', 'Senegal', 'Sierra Leone', 'Togo'
];

get nonEcowasCountries(): string[] {
  // Any country in your master list not in ECOWAS will show here
  const ecowas = new Set(this.ecowasCountries);
  return this.countries.filter(c => !ecowas.has(c));
}
tempApplicationId = this.generateTempId();
finalApplicationId: string | null = null;

private generateTempId(): string {
  return 'TMP-' + Date.now().toString(36).toUpperCase();
}


  today = new Date();

  private destroy$ = new Subject<void>();

  form!: FormGroup<ApplicationFormModel>;

  /** Signals for UI state */
  appType = signal<ApplicationType>('L1');
  isL2 = computed(() => this.appType() === 'L2');
  isY1 = computed(() => this.appType() === 'Y1');
  isF1 = computed(() => this.appType() === 'F1'); // ✅ Added

  public trackByCountry: TrackByFunction<string> = (_: number, c: string) => c;

  constructor(private fb: FormBuilder,private dialog: MatDialog) {
    this.buildForm();
    localStorage.setItem(
  `application:${this.tempApplicationId}`,
  JSON.stringify({ form: this.form.value })
);

    this.handleApplicationTypeChanges();
  }

loadApplication(tempId: string) {
  const data = localStorage.getItem(`application:${tempId}`);
  if (!data) return;

  const parsed = JSON.parse(data);
  this.form.patchValue(parsed.form);
  this.appType.set(parsed.appType);
  this.tempApplicationId = tempId;
}


  /** Accessors */
  get application() { return this.form.controls.application; }
  get personalInfo() { return this.form.controls.personalInfo; }
  get placeOfBirth() { return this.form.controls.placeOfBirth; }
  get passportInfo() { return this.form.controls.passportInfo; }
  get guardianInfo() { return this.form.controls.guardianInfo; }
  get foreignInfo() { return this.form.controls.foreignInfo; } // ✅ Added
  get documents() { return this.form.controls.documents; }

  get applicationType(): ApplicationType {
    return this.application.controls.applicationType.value;
  }

  private buildForm() {
    this.form = this.fb.group<ApplicationFormModel>({
      application: this.fb.group<ApplicationGroup>({
        applicationType: this.fb.nonNullable.control<ApplicationType>('L1', { validators: [Validators.required] }),
      }),

      personalInfo: this.fb.group<PersonalInfoGroup>({
        surname: this.fb.nonNullable.control('', [Validators.required]),
        givenNames: this.fb.nonNullable.control('', [Validators.required]),
        dateOfBirth: this.fb.control<Date | null>(null, [Validators.required]),
        gender: this.fb.nonNullable.control('', [Validators.required]),

        // ✅ Added
        phone: this.fb.nonNullable.control(''),
        email: this.fb.nonNullable.control('', [Validators.email]),
      }),

      placeOfBirth: this.fb.group<PlaceOfBirthGroup>({
        city: this.fb.nonNullable.control('', [Validators.required]),
        county: this.fb.nonNullable.control('', [Validators.required]),
        country: this.fb.nonNullable.control('', [Validators.required]),
      }),

      passportInfo: this.fb.group<PassportInfoGroup>({
        passportNumber: this.fb.nonNullable.control(''),
        issueDate: this.fb.control<Date | null>(null),
        expiryDate: this.fb.control<Date | null>(null),
        issuePlace: this.fb.nonNullable.control(''),
      }),

      guardianInfo: this.fb.group<GuardianInfoGroup>({
        guardianFullName: this.fb.nonNullable.control(''),
        relationship: this.fb.nonNullable.control(''),
        guardianPhone: this.fb.nonNullable.control(''),
      }),

      // ✅ Added Foreign group
      foreignInfo: this.fb.group<ForeignInfoGroup>({
  nationalityCategory: this.fb.control<NationalityCategory | null>(null),
  nationality: this.fb.nonNullable.control(''),

  passportNumber: this.fb.nonNullable.control(''),
  passportIssueDate: this.fb.control<Date | null>(null),
  passportExpiryDate: this.fb.control<Date | null>(null),
  visaNumber: this.fb.nonNullable.control(''),
  residencePermitNumber: this.fb.nonNullable.control(''),
  employerInstitution: this.fb.nonNullable.control(''),
  durationOfStay: this.fb.nonNullable.control(''),
  currentAddressLiberia: this.fb.nonNullable.control(''),
  permanentAddressHome: this.fb.nonNullable.control(''),
}),


      documents: this.fb.group<DocumentsGroup>({
        photo: this.fb.control<File | null>(null, {
          validators: [
            Validators.required,
            this.fileTypeValidator(['image/jpeg', 'image/png']),
            this.maxSizeValidator(this.MAX_PHOTO_SIZE),
          ],
        }),
        birthCertificate: this.fb.control<File | null>(null),
        passportCopy: this.fb.control<File | null>(null),
        addressProof: this.fb.control<File | null>(null),

        // ✅ Added
        permitProof: this.fb.control<File | null>(null),
      }),
    });
  }

  private handleApplicationTypeChanges() {
    this.appType.set(this.application.controls.applicationType.value);

    this.application.controls.applicationType.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((type: ApplicationType) => {
        this.appType.set(type);

        this.setDocumentValidators(type);
        this.setForeignValidators(type);
        this.setPassportValidators(type);
        this.setGuardianValidators(type);
      });

    // Ensure validators match default
    const initial = this.applicationType;
    this.setDocumentValidators(initial);
    this.setForeignValidators(initial);
    this.setPassportValidators(initial);
    this.setGuardianValidators(initial);
  }

  /** ✅ Passport validators (only for L2) */
  private setPassportValidators(type: ApplicationType) {
    const pi = this.passportInfo;

    // clear
    Object.values(pi.controls).forEach(c => c.clearValidators());

    if (type === 'L2') {
      pi.controls.passportNumber.addValidators([Validators.required]);
      pi.controls.issueDate.addValidators([Validators.required]);
      pi.controls.expiryDate.addValidators([Validators.required]);
    }

    Object.values(pi.controls).forEach(c => c.updateValueAndValidity({ emitEvent: false }));
  }

  /** ✅ Guardian validators (only for Y1) */
  private setGuardianValidators(type: ApplicationType) {
    const gi = this.guardianInfo;

    Object.values(gi.controls).forEach(c => c.clearValidators());

    if (type === 'Y1') {
      gi.controls.guardianFullName.addValidators([Validators.required]);
      gi.controls.relationship.addValidators([Validators.required]);
      gi.controls.guardianPhone.addValidators([Validators.required]);
    }

    Object.values(gi.controls).forEach(c => c.updateValueAndValidity({ emitEvent: false }));
  }

  /** ✅ Foreign validators (only for F1) */
 private setForeignValidators(type: ApplicationType) {
  const fi = this.foreignInfo;

  // Clear validators first
  Object.values(fi.controls).forEach(c => c.clearValidators());

  if (type === 'F1') {
    fi.controls.nationalityCategory.addValidators([Validators.required]);
    fi.controls.nationality.addValidators([Validators.required]);

    fi.controls.passportNumber.addValidators([Validators.required]);
    fi.controls.residencePermitNumber.addValidators([Validators.required]);
    fi.controls.currentAddressLiberia.addValidators([Validators.required]);

    // Optional: when category changes, clear nationality
    fi.controls.nationalityCategory.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        fi.controls.nationality.setValue('');
        fi.controls.nationality.markAsUntouched();
      });
  }

  Object.values(fi.controls).forEach(c => c.updateValueAndValidity({ emitEvent: false }));
}


  /** ✅ Documents validators (L1/Y1/L2/F1) */
  private setDocumentValidators(type: ApplicationType) {
    const docs = this.documents;
    const bc = docs.controls.birthCertificate;
    const pc = docs.controls.passportCopy;
    const ap = docs.controls.addressProof;
    const pp = docs.controls.permitProof;

    // Clear all
    [bc, pc, ap, pp].forEach(ctrl => ctrl.clearValidators());

    // Add file-type & size rules
    bc.addValidators([
      this.fileTypeValidator(['application/pdf', 'image/jpeg', 'image/png']),
      this.maxSizeValidator(this.MAX_DOC_SIZE),
    ]);

    pc.addValidators([
      this.fileTypeValidator(['application/pdf', 'image/jpeg', 'image/png']),
      this.maxSizeValidator(this.MAX_DOC_SIZE),
    ]);

    ap.addValidators([
      this.fileTypeValidator(['application/pdf']),
      this.maxSizeValidator(this.MAX_DOC_SIZE),
    ]);

    pp.addValidators([
      this.fileTypeValidator(['application/pdf', 'image/jpeg', 'image/png']),
      this.maxSizeValidator(this.MAX_DOC_SIZE),
    ]);

    // Required based on type
    if (type === 'L1' || type === 'Y1') {
      bc.addValidators([Validators.required]);
    }

    if (type === 'L2') {
      pc.addValidators([Validators.required]);
      ap.addValidators([Validators.required]);
    }

    if (type === 'F1') {
      pc.addValidators([Validators.required]);
      pp.addValidators([Validators.required]); // permitProof required for F1
    }

    [bc, pc, ap, pp].forEach(c => c.updateValueAndValidity({ emitEvent: false }));
  }

  /** File validators */
  private maxSizeValidator(maxSize: number) {
    return (control: AbstractControl): ValidationErrors | null => {
      const file = control.value as File | null;
      if (file && file.size > maxSize) {
        return { maxSize: { max: maxSize, actual: file.size } };
      }
      return null;
    };
  }

  private fileTypeValidator(allowed: string[]) {
    return (control: AbstractControl): ValidationErrors | null => {
      const file = control.value as File | null;
      if (file && !allowed.includes(file.type)) {
        return { fileType: { allowed, actual: file.type } };
      }
      return null;
    };
  }

  onFileChange(event: Event, controlName: keyof DocumentsGroup) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    this.documents.controls[controlName].setValue(file);
    this.documents.controls[controlName].markAsDirty();
    this.documents.controls[controlName].updateValueAndValidity();
  }

 submit() {
  if (this.form.invalid) {
    this.form.markAllAsTouched();
    return;
  }
const dialogRef = this.dialog.open(DeclarationDialogComponent);


  dialogRef.afterClosed().subscribe(() => {
    this.finalApplicationId = 'APP-' + Date.now().toString(36).toUpperCase();

    this.dialog.open(SubmissionSuccessDialog, {
      data: { applicationId: this.finalApplicationId }
    });

    // Cleanup temp save
    localStorage.removeItem(`application:${this.tempApplicationId}`);
  });
}


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  saveAndExit() {
  localStorage.setItem(
    `application:${this.tempApplicationId}`,
    JSON.stringify({
      tempId: this.tempApplicationId,
      form: this.form.value,
      appType: this.appType()
    })
  );

  alert(`Application saved.\nYour Temporary ID is:\n${this.tempApplicationId}`);
}
exitApplication() {
  const confirmExit = confirm(
    'Are you sure you want to exit?\nUnsaved changes will be lost.'
  );

  if (confirmExit) {
    // Navigate away or reset
    this.form.reset();
  }
}


}
