/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export interface ExternalServiceAvailabilityContext {
  [key: string]: unknown;
}

export interface ExternalServiceConfiguration {
  id: string;
  label: string;
  description: string;
  icon: string;
  route: string[];
  requiredPermission?: string | string[];
  isAvailable?: (context: ExternalServiceAvailabilityContext) => boolean;
}

export const EXTERNAL_SERVICE_REGISTRY: readonly ExternalServiceConfiguration[] = [
  {
    id: 'amazon-s3',
    label: 'labels.heading.S3 Amazon External Service',
    description: 'labels.text.S3 Amazon Service Configuration',
    icon: 'cloud',
    route: ['amazon-s3']
  },
  {
    id: 'sms',
    label: 'labels.heading.SMS External Service',
    description: 'labels.text.SMS Service Configuration',
    icon: 'comment-alt',
    route: ['sms']
  },
  {
    id: 'email',
    label: 'labels.heading.Email External Service',
    description: 'labels.text.Email Service Configuration',
    icon: 'envelope',
    route: ['email']
  },
  {
    id: 'notification',
    label: 'labels.heading.Notification External Service',
    description: 'labels.text.Notification Service Configuration',
    icon: 'bell',
    route: ['notification']
  }
];

export function hasExternalServicePermission(
  service: ExternalServiceConfiguration,
  userPermissions: string[],
  rbacEnabled: boolean
): boolean {
  if (!service.requiredPermission || !rbacEnabled) {
    return true;
  }

  if (userPermissions.includes('ALL_FUNCTIONS')) {
    return true;
  }

  const requiredPermissions = Array.isArray(service.requiredPermission)
    ? service.requiredPermission
    : [service.requiredPermission];

  return requiredPermissions.some((permission: string) => {
    const trimmedPermission = permission.trim();
    return (
      trimmedPermission !== '' &&
      (userPermissions.includes(trimmedPermission) ||
        (trimmedPermission.startsWith('READ_') && userPermissions.includes('ALL_FUNCTIONS_READ')))
    );
  });
}

export function isExternalServiceAvailable(
  service: ExternalServiceConfiguration,
  context: ExternalServiceAvailabilityContext
): boolean {
  return service.isAvailable ? service.isAvailable(context) : true;
}

export function getVisibleExternalServices(
  registry: readonly ExternalServiceConfiguration[],
  context: ExternalServiceAvailabilityContext,
  userPermissions: string[],
  rbacEnabled: boolean
): ExternalServiceConfiguration[] {
  return registry.filter(
    (service: ExternalServiceConfiguration) =>
      isExternalServiceAvailable(service, context) &&
      hasExternalServicePermission(service, userPermissions, rbacEnabled)
  );
}
