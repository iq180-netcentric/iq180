import { Injectable, InjectionToken } from '@angular/core';
import { environment } from 'src/environments/environment';

export const ENV = new InjectionToken<string>('environment');

export const Environment = { provide: ENV, useValue: environment };
