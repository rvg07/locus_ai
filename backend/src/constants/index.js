// ----- Definitions or our immutable objects for the project -- //

const USER_ATTRIBUTES = Object.freeze([
    'name',
    'surname',
    'birth_date',
    'sex'
]);

const GROUP_ATTRIBUTES = Object.freeze([
    'name'
]);

const USER_SEX = Object.freeze({
    MALE: 'male',
    FEMALE: 'female',
    OTHER: 'other',
});

const PAGINATION = Object.freeze({
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 100,
    DEFAULT_PAGE_NUMBER: 1,
});

const TABLE_NAMES = Object.freeze({
    USERS: 'users',
    GROUPS: '`groups`',
    USER_GROUPS: 'user_groups'
});

const HTTP_STATUS = Object.freeze({
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500
});

const STATUS_STRING = Object.freeze({
    SUCCESS: 'success',
    ERROR: 'error'
});

const DB_ERROR_CODES = Object.freeze({
    ER_DUP_ENTRY: 'ER_DUP_ENTRY',//duplicate entry mysql error code
    ER_NO_REFERENCED_ROW: 'ER_NO_REFERENCED_ROW',//foreign key constraint violated mysql error code
});

module.exports={
    USER_ATTRIBUTES,
    USER_SEX,
    GROUP_ATTRIBUTES,
    PAGINATION,
    HTTP_STATUS,
    TABLE_NAMES,
    STATUS_STRING,
    DB_ERROR_CODES
}