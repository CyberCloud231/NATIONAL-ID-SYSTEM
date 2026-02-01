import { Component, OnDestroy, OnInit, signal, computed, TrackByFunction } from '@angular/core';
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
import { Observable, Subject } from 'rxjs';
import { map, startWith, tap, takeUntil } from 'rxjs/operators';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DeclarationDialogComponent } from '../Delclaration-Dialog/DeclarationDialog.component';
import { SubmissionSuccessDialog } from '../Submission-Dialog/SubmissionDialog.component';

type ApplicationType = 'L1' | 'L2' | 'Y1' | 'F1';

type PersonalInfoGroup = {
  surname: FormControl<string>;
  givenNames: FormControl<string>;
  dateOfBirth: FormControl<Date | null>;
  gender: FormControl<string>;
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
  permitProof: FormControl<File | null>;
};

type ApplicationGroup = {
  applicationType: FormControl<ApplicationType>;
};

type Id = string;

interface County {
  id: Id;
  name: string;
}
interface District {
  id: Id;
  name: string;
  countyId: Id;
}
interface Center {
  id: Id;
  name: string;
  address: string;
  districtId: Id;
}

type CountyOfApplicationGroup = {
  county: FormControl<string>;
  district: FormControl<string>;
  center: FormControl<string>;
};

type ApplicationFormModel = {
  application: FormGroup<ApplicationGroup>;
  personalInfo: FormGroup<PersonalInfoGroup>;
  placeOfBirth: FormGroup<PlaceOfBirthGroup>;
  countyOfApplication: FormGroup<CountyOfApplicationGroup>;
  passportInfo: FormGroup<PassportInfoGroup>;
  guardianInfo: FormGroup<GuardianInfoGroup>;
  foreignInfo: FormGroup<ForeignInfoGroup>;
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
export class ApplicationForm implements OnInit, OnDestroy {
  readonly countries = ['Liberia', 'Ghana', 'Nigeria', 'USA', 'UK', 'Canada'];
  readonly MAX_PHOTO_SIZE = 2 * 1024 * 1024; // 2MB
  readonly MAX_DOC_SIZE = 5 * 1024 * 1024; // 5MB
  readonly ecowasCountries: string[] = [
    'Benin',
    'Burkina Faso',
    'Cabo Verde',
    'Côte d’Ivoire',
    'The Gambia',
    'Ghana',
    'Guinea',
    'Guinea-Bissau',
    'Liberia',
    'Mali',
    'Niger',
    'Nigeria',
    'Senegal',
    'Sierra Leone',
    'Togo',
  ];

  get nonEcowasCountries(): string[] {
    const ecowas = new Set(this.ecowasCountries);
    return this.countries.filter((c) => !ecowas.has(c));
  }

  counties: County[] = [
    { id: 'c-mn', name: 'Montserrado' },
    { id: 'c-bg', name: 'Bong' },
    { id: 'c-nm', name: 'Nimba' },
  ];

  districts: District[] = [
    { id: 'd-mn-1', name: 'Central Monrovia', countyId: 'c-mn' },
    { id: 'd-mn-2', name: 'Paynesville', countyId: 'c-mn' },
    { id: 'd-bg-1', name: 'Gbarnga', countyId: 'c-bg' },
    { id: 'd-nm-1', name: 'Sanniquellie', countyId: 'c-nm' },
  ];

  centers: Center[] = [
    {
      id: 'cn-mn-1a',
      name: 'NIRL Center Broad St',
      address: 'Broad St, Monrovia',
      districtId: 'd-mn-1',
    },
    {
      id: 'cn-mn-2a',
      name: 'NIRL Center Paynesville',
      address: 'Red Light, Paynesville',
      districtId: 'd-mn-2',
    },
    {
      id: 'cn-bg-1a',
      name: 'NIRL Center Gbarnga',
      address: 'Main St, Gbarnga',
      districtId: 'd-bg-1',
    },
    {
      id: 'cn-nm-1a',
      name: 'NIRL Center Sanniquellie',
      address: 'Center Rd, Sanniquellie',
      districtId: 'd-nm-1',
    },
  ];

  filteredDistricts$!: Observable<District[]>;
  filteredCenters$!: Observable<Center[]>;

  trackById: TrackByFunction<{ id: string }> = (_: number, item) => item.id;

  public trackByCounty: TrackByFunction<County> = (_: number, item: County) => item.id;
  public trackByDistrict: TrackByFunction<District> = (_: number, item: District) => item.id;
  public trackByCenter: TrackByFunction<Center> = (_: number, item: Center) => item.id;
  public trackByCountry: TrackByFunction<string> = (_: number, c: string) => c;

  tempApplicationId = this.generateTempId();
  finalApplicationId: string | null = null;
  today = new Date();
  private destroy$ = new Subject<void>();
  form!: FormGroup<ApplicationFormModel>;

  /** Angular signals for application type */
  appType = signal<ApplicationType>('L1');
  isL2 = computed(() => this.appType() === 'L2');
  isY1 = computed(() => this.appType() === 'Y1');
  isF1 = computed(() => this.appType() === 'F1');

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
  ) {
    this.buildForm();

    // Save initial (optional)
    localStorage.setItem(
      `application:${this.tempApplicationId}`,
      JSON.stringify({ form: this.form.value }),
    );

    this.handleApplicationTypeChanges();
  }

  /** ---- Accessors ---- */
  get application() {
    return this.form.controls.application;
  }
  get personalInfo() {
    return this.form.controls.personalInfo;
  }
  get placeOfBirth() {
    return this.form.controls.placeOfBirth;
  }
  get passportInfo() {
    return this.form.controls.passportInfo;
  }
  get guardianInfo() {
    return this.form.controls.guardianInfo;
  }
  get foreignInfo() {
    return this.form.controls.foreignInfo;
  }
  get documents() {
    return this.form.controls.documents;
  }

  get countyOfApplication() {
    return this.form.controls.countyOfApplication;
  }
  get countyCtrl() {
    return this.countyOfApplication.controls.county;
  }
  get districtCtrl() {
    return this.countyOfApplication.controls.district;
  }
  get centerCtrl() {
    return this.countyOfApplication.controls.center;
  }

  get applicationType(): ApplicationType {
    return this.application.controls.applicationType.value;
  }

  /** ---- Lifecycle ---- */
  ngOnInit(): void {
    this.wireCountyDistrictCenterStreams();
    this.setCountyOfApplicationValidators(this.applicationType);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /** ---- Build form ---- */
  private buildForm() {
    this.form = this.fb.group<ApplicationFormModel>({
      application: this.fb.group<ApplicationGroup>({
        applicationType: this.fb.nonNullable.control<ApplicationType>('L1', {
          validators: [Validators.required],
        }),
      }),

      personalInfo: this.fb.group<PersonalInfoGroup>({
        surname: this.fb.nonNullable.control('', [Validators.required]),
        givenNames: this.fb.nonNullable.control('', [Validators.required]),
        dateOfBirth: this.fb.control<Date | null>(null, [Validators.required]),
        gender: this.fb.nonNullable.control('', [Validators.required]),
        phone: this.fb.nonNullable.control(''),
        email: this.fb.nonNullable.control('', [Validators.email]),
      }),

      placeOfBirth: this.fb.group<PlaceOfBirthGroup>({
        city: this.fb.nonNullable.control('', [Validators.required]),
        county: this.fb.nonNullable.control('', [Validators.required]),
        country: this.fb.nonNullable.control('', [Validators.required]),
      }),

      countyOfApplication: this.fb.group<CountyOfApplicationGroup>({
        county: this.fb.nonNullable.control(''),
        district: new FormControl<string>({ value: '', disabled: true }, { nonNullable: true }),
        center: new FormControl<string>({ value: '', disabled: true }, { nonNullable: true }),
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
        permitProof: this.fb.control<File | null>(null),
      }),
    });
  }

  /** ---- Application type → dynamic validators ---- */
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
        this.setCountyOfApplicationValidators(type);
      });

    const initial = this.applicationType;
    this.setDocumentValidators(initial);
    this.setForeignValidators(initial);
    this.setPassportValidators(initial);
    this.setGuardianValidators(initial);
    this.setCountyOfApplicationValidators(initial);
  }

  private setPassportValidators(type: ApplicationType) {
    const pi = this.passportInfo;

    Object.values(pi.controls).forEach((c) => c.clearValidators());

    if (type === 'L2') {
      pi.controls.passportNumber.addValidators([Validators.required]);
      pi.controls.issueDate.addValidators([Validators.required]);
      pi.controls.expiryDate.addValidators([Validators.required]);
    }

    Object.values(pi.controls).forEach((c) => c.updateValueAndValidity({ emitEvent: false }));
  }

  private setGuardianValidators(type: ApplicationType) {
    const gi = this.guardianInfo;

    Object.values(gi.controls).forEach((c) => c.clearValidators());

    if (type === 'Y1') {
      gi.controls.guardianFullName.addValidators([Validators.required]);
      gi.controls.relationship.addValidators([Validators.required]);
      gi.controls.guardianPhone.addValidators([Validators.required]);
    }

    Object.values(gi.controls).forEach((c) => c.updateValueAndValidity({ emitEvent: false }));
  }

  private setForeignValidators(type: ApplicationType) {
    const fi = this.foreignInfo;
    Object.values(fi.controls).forEach((c) => c.clearValidators());

    if (type === 'F1') {
      fi.controls.nationalityCategory.addValidators([Validators.required]);
      fi.controls.nationality.addValidators([Validators.required]);
      fi.controls.passportNumber.addValidators([Validators.required]);
      fi.controls.residencePermitNumber.addValidators([Validators.required]);
      fi.controls.currentAddressLiberia.addValidators([Validators.required]);

      fi.controls.nationalityCategory.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
        fi.controls.nationality.setValue('');
        fi.controls.nationality.markAsUntouched();
        fi.controls.nationality.updateValueAndValidity();
      });
    }

    Object.values(fi.controls).forEach((c) => c.updateValueAndValidity({ emitEvent: false }));
  }

  private setDocumentValidators(type: ApplicationType) {
    const docs = this.documents;
    const bc = docs.controls.birthCertificate;
    const pc = docs.controls.passportCopy;
    const ap = docs.controls.addressProof;
    const pp = docs.controls.permitProof;

    [bc, pc, ap, pp].forEach((ctrl) => ctrl.clearValidators());

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

    if (type === 'L1' || type === 'Y1') {
      bc.addValidators([Validators.required]);
    }
    if (type === 'L2') {
      pc.addValidators([Validators.required]);
      ap.addValidators([Validators.required]);
    }
    if (type === 'F1') {
      pc.addValidators([Validators.required]);
      pp.addValidators([Validators.required]);
    }

    [bc, pc, ap, pp].forEach((c) => c.updateValueAndValidity({ emitEvent: false }));
  }

  private setCountyOfApplicationValidators(type: ApplicationType) {
    const grp = this.countyOfApplication;
    const { county, district, center } = grp.controls;

    [county, district, center].forEach((c) => c.clearValidators());

    if (type === 'L2') {
      grp.disable({ emitEvent: false });
      grp.reset({ county: '', district: '', center: '' }, { emitEvent: false });
    } else {
      grp.enable({ emitEvent: false });
      county.addValidators([Validators.required]);
      district.addValidators([Validators.required]);
      center.addValidators([Validators.required]);

      if (!county.value) {
        district.disable({ emitEvent: false });
        center.disable({ emitEvent: false });
      } else if (!district.value) {
        center.disable({ emitEvent: false });
      }
    }

    [county, district, center].forEach((c) => c.updateValueAndValidity({ emitEvent: false }));
  }

  private wireCountyDistrictCenterStreams() {
    this.filteredDistricts$ = this.countyCtrl.valueChanges.pipe(
      startWith(this.countyCtrl.value),
      tap(() => {
        this.districtCtrl.reset('');
        this.centerCtrl.reset('');
        this.centerCtrl.disable({ emitEvent: false });
      }),
      tap((countyId: string) => {
        const enable = !!countyId && !this.isL2();
        if (enable) this.districtCtrl.enable({ emitEvent: false });
        else this.districtCtrl.disable({ emitEvent: false });
      }),
      map((countyId: string) =>
        this.districts.filter((d) => (countyId ? d.countyId === countyId : false)),
      ),
      takeUntil(this.destroy$),
    );

    this.filteredCenters$ = this.districtCtrl.valueChanges.pipe(
      startWith(this.districtCtrl.value),
      tap(() => this.centerCtrl.reset('')),
      tap((districtId: string) => {
        const enable = !!districtId && !this.isL2();
        if (enable) this.centerCtrl.enable({ emitEvent: false });
        else this.centerCtrl.disable({ emitEvent: false });
      }),
      map((districtId: string) =>
        this.centers.filter((c) => (districtId ? c.districtId === districtId : false)),
      ),
      takeUntil(this.destroy$),
    );
  }

  private restoreCountyDistrictCenterSelections(): void {
    if (this.isL2()) return;

    const countyId = this.countyCtrl.value;
    const districtId = this.districtCtrl.value;
    const centerId = this.centerCtrl.value;

    if (!countyId) {
      this.districtCtrl.disable({ emitEvent: false });
      this.centerCtrl.disable({ emitEvent: false });
      return;
    }

    this.districtCtrl.enable({ emitEvent: false });

    const districtsForCounty = this.districts.filter((d) => d.countyId === countyId);
    const districtExists = !!districtsForCounty.find((d) => d.id === districtId);
    if (!districtExists) {
      this.districtCtrl.setValue('', { emitEvent: false });
      this.centerCtrl.setValue('', { emitEvent: false });
      this.centerCtrl.disable({ emitEvent: false });
      return;
    }

    this.districtCtrl.setValue(districtId, { emitEvent: false });

    const centersForDistrict = this.centers.filter((c) => c.districtId === districtId);
    const centerExists = !!centersForDistrict.find((c) => c.id === centerId);
    if (!centerExists) {
      this.centerCtrl.setValue('', { emitEvent: false });
      this.centerCtrl.disable({ emitEvent: false });
      return;
    }

    this.centerCtrl.enable({ emitEvent: false });
    this.centerCtrl.setValue(centerId, { emitEvent: false });
  }

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

  loadApplication(tempId: string) {
    const data = localStorage.getItem(`application:${tempId}`);
    if (!data) return;

    const parsed = JSON.parse(data);
    this.form.patchValue(parsed.form);
    this.appType.set(parsed.appType);
    this.tempApplicationId = tempId;

    this.setCountyOfApplicationValidators(this.appType());

    this.restoreCountyDistrictCenterSelections();
  }

  saveAndExit() {
    localStorage.setItem(
      `application:${this.tempApplicationId}`,
      JSON.stringify({
        tempId: this.tempApplicationId,
        form: this.form.value,
        appType: this.appType(),
      }),
    );

    alert(`Application saved.\nYour Temporary ID is:\n${this.tempApplicationId}`);
  }

  exitApplication() {
    const confirmExit = confirm('Are you sure you want to exit?\nUnsaved changes will be lost.');

    if (confirmExit) {
      this.form.reset();
    }
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
        data: { applicationId: this.finalApplicationId },
      });

      localStorage.removeItem(`application:${this.tempApplicationId}`);
    });
  }

  private generateTempId(): string {
    return 'TMP-' + Date.now().toString(36).toUpperCase();
  }
}
