import { createTheme } from '@mui/material/styles';

const offerFormTheme = createTheme({
  components: {
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '2em',
          border: '1px solid #669DD5', 
          backgroundColor: '#005BB9',
          color: 'white',
          '&:hover': {
            border: '1px solid white',
          },
          '& .MuiChip-deleteIcon': {
            color: 'white', 
            '&:hover': {
              color: '#e0e0e0',
            }
          }
        },
        outlined: {
          border: '1px solid white',
        },
      },
      variants: [
        {
          props: { variant: 'custom' },
          style: {
            border: '1px solid white',
            backgroundColor: '#1976d2',
          },
        },
      ],
    },
    MuiAutocomplete: {
      styleOverrides: {
        paper: {
          borderRadius: 0, 
          '& .MuiAutocomplete-option': {
            fontFamily: 'Montserrat',
            fontSize: '0.875rem', 
            padding: '8px 16px', 
          }
        },
        popper: {
          borderRadius: 0, 
        },
        listbox: {
          padding: 0, 
          '& .MuiAutocomplete-option': {
            fontFamily: 'Montserrat',
            minHeight: 'auto', 
            '&[aria-selected="true"]': {
              backgroundColor: 'rgba(25, 118, 210, 0.08)',
            },
            '&[aria-selected="true"].Mui-focused': {
              backgroundColor: 'rgba(25, 118, 210, 0.12)', 
            },
          }
        }
      }
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          borderRadius: 0, 
          '& .MuiAutocomplete-endAdornment': {
            '& .MuiSvgIcon-root': {
              fontSize: '1.25rem', 
              color: '#fff',
            }
          }
        }
      }
    },
    MuiOutlinedInput: {
      styleOverrides: {
        notchedOutline: {
          borderRadius: 0,
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiInputBase-inputMultiline': {
            fontFamily: 'Montserrat',
            color: '#fff',
            '&.Mui-disabled': {
              color: '#fff',
              WebkitTextFillColor: '#fff', 
              opacity: 1, // Убедитесь, что прозрачность 100%
            },
          },
          '& .MuiOutlinedInput-root.Mui-disabled': {
            '& .MuiInputBase-inputMultiline': {
              color: '#fff',
              WebkitTextFillColor: '#fff',
            },
            '& fieldset': {
              borderColor: '#ffffffb7',
            },
          },
            '& .MuiInputAdornment-root .MuiSvgIcon-root': {
              color: '#fff',
            },
          '& .MuiInputLabel-outlined': {
            fontFamily: 'Montserrat',
            color: '#669DD5',
            backgroundColor: '#005BB9',
            paddingRight: '8px',
            '&.Mui-disabled': {
              color: '#fff'
            }
          },
          '& .MuiInputLabel-outlined.Mui-focused': {
            marginRight: '8px',
            color: '#ffffffb7',
            backgroundColor: '#005BB9',
            paddingRight: '8px',
          },
          '&:hover .MuiInputLabel-outlined': {
            color: '#ffffffb7',
          },
          '&:hover .MuiInputLabel-outlined.Mui-focused': {
            color: '#fff',
          },
          '& .MuiOutlinedInput-root': {
            '& input': {
              fontFamily: 'Montserrat',
              color: '#fff',
              '&:-webkit-autofill': {
                WebkitBoxShadow: '0 0 0 100px #005BB9 inset',
                WebkitTextFillColor: '#fff',
                caretColor: '#fff',
                borderRadius: '0',
              },
            },
            '& fieldset': {
              border: '1px solid white',
              borderRadius: '0px',
            },
            '&:hover fieldset': {
              borderColor: '#ffffffb7',
            },
            '&.Mui-focused fieldset': {
              border: '1px solid white',
              borderRadius: '0px',
            },
            icon: {
              '&.Mui-disabled': {
                display: 'none',
              },
            },
            '&.Mui-disabled': {
              '& input': {
                color: '#fff',
                WebkitTextFillColor: '#fff',
              },
              '& fieldset': {
                borderColor: '#ffffffb7',
              },
              '&:hover fieldset': {
                borderColor: '#ffffffb7',
              },
            },
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          fontFamily: 'Montserrat',
          fontWeight: 400,
          fontSize: '1em',
          color: '#669DD5',
          border: '1px solid #005BB9',
          backgroundColor: '#005BB9',
          borderRadius: '0px',
          textTransform: 'none',
          padding: '0.8em',
          whiteSpace: 'nowrap',
          minWidth: 0,
          '&:hover': {
            border: '1px solid #669DD5',
            boxShadow: 'none',
            color: '#ffffffb7',
          },
          '&.Mui-selected': {
            border: '1px solid white',
            backgroundColor: '#004a9e',
            color: '#fff',
          },
          '&.Mui-disabled': {
            color: 'rgba(255, 255, 255, 0.3)',
          },
        },
      },
    },
  },
});

const registerFormTheme = createTheme({
  components: {
    MuiAutocomplete: {
      styleOverrides: {
        paper: {
          borderRadius: 0, 
          '& .MuiAutocomplete-option': {
            fontFamily: 'Montserrat',
            fontSize: '0.875rem', 
            padding: '8px 16px', 
          }
        },
        popper: {
          borderRadius: 0, 
        },
        listbox: {
          padding: 0, 
          '& .MuiAutocomplete-option': {
            fontFamily: 'Montserrat',
            minHeight: 'auto', 
            '&[aria-selected="true"]': {
              backgroundColor: 'rgba(25, 118, 210, 0.08)',
            },
            '&[aria-selected="true"].Mui-focused': {
              backgroundColor: 'rgba(25, 118, 210, 0.12)', 
            },
          }
        }
      }
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          borderRadius: 0, 
          '& .MuiAutocomplete-endAdornment': {
            '& .MuiSvgIcon-root': {
              fontSize: '1.25rem', 
              color: '#fff',
            }
          }
        }
      }
    },
    MuiOutlinedInput: {
      styleOverrides: {
        notchedOutline: {
          borderRadius: 0,
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiInputLabel-outlined': {
            fontFamily: 'Montserrat',
            color: '#000',
            backgroundColor: '#fff',
            paddingRight: '8px',
          },
          '& .MuiInputLabel-outlined.Mui-focused': {
            marginRight: '8px',
            color: 'black',
            backgroundColor: '#fff',
            paddingRight: '8px',
          },
          '&:hover .MuiInputLabel-outlined': {
            color: 'grey',
          },
          '&:hover .MuiInputLabel-outlined.Mui-focused': {
            color: 'grey',
          },
          '& .MuiOutlinedInput-root': {
            '& input': {
              fontFamily: 'Montserrat',
              color: '#000',
              '&:-webkit-autofill': {
                WebkitBoxShadow: '0 0 0 100px #fff inset',
                WebkitTextFillColor: 'black',
                caretColor: '#fff',
                borderRadius: '0',
              },
            },
            '& fieldset': {
              border: '1px solid black',
              borderRadius: '0px',
            },
            '&:hover fieldset': {
              borderColor: 'grey',
            },
            '&.Mui-focused fieldset': {
              border: '1px solid grey',
              borderRadius: '0px',
            },
          },
        },
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          fontFamily: 'Montserrat',
          color: '#666',
          marginLeft: 0, 
          marginTop: '4px', 
          fontSize: '0.75rem',
          '&.Mui-error': { 
            color: '#d32f2f', 
          },
        },
      },
    },
    
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '0 !important',
          border: '1px solid black',
          boxShadow: 'none',
        },
      },
    },

    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontFamily: 'Montserrat',
          '&.Mui-selected': {
            backgroundColor: 'rgba(0, 0, 0, 0.08)',
          },
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
          },
        },
      },
    },

    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontFamily: 'Montserrat',
          color: 'black',
          '&.Mui-focused': {
            color: 'black',
            backgroundColor: '#fff',
          },
        },
        outlined: {
          backgroundColor: '#fff',
          paddingRight: '8px',
          transform: 'translate(14px, 14px) scale(1)',
          '&.MuiInputLabel-shrink': {
            transform: 'translate(14px, -9px) scale(0.75)', 
          },
        },
      },
    },
    MuiDatePicker: {
      styleOverrides: {
        root: {
          '& .MuiInputLabel-outlined': {
            fontFamily: 'Montserrat',
            color: '#000',
            backgroundColor: '#fff',
            paddingRight: '8px',
          },
          '& .MuiInputLabel-outlined.Mui-focused': {
            marginRight: '8px',
            color: 'black',
            backgroundColor: '#fff',
            paddingRight: '8px',
          },
          '&:hover .MuiInputLabel-outlined': {
            color: 'grey',
          },
          '&:hover .MuiInputLabel-outlined.Mui-focused': {
            color: 'grey',
          },
          '& .MuiOutlinedInput-root': {
            '& input': {
              fontFamily: 'Montserrat',
              color: '#000',
              '&:-webkit-autofill': {
                WebkitTextFillColor: 'black',
                color: 'black',
                caretColor: 'black',
                borderRadius: '0',
              },
            },
            '& fieldset': {
              border: '1px solid black',
              borderRadius: '0px',
            },
            '&:hover fieldset': {
              borderColor: 'grey',
            },
            '&.Mui-focused fieldset': {
              border: '1px solid grey',
              borderRadius: '0px',
            },
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          fontFamily: 'Montserrat',
          fontWeight: 400,
          fontSize: '1em',
          color: 'black',
          border: '1px solid black',
          backgroundColor: '#fff',
          borderRadius: '0px',
          textTransform: 'none',
          padding: '0.8em',
          whiteSpace: 'nowrap',
          boxShadow: 'none',
          minWidth: 0,
          '&:hover': {
            border: '1px solid grey',
            boxShadow: 'none',
            color: 'grey',
          },
          '&.Mui-selected': {
            border: '1px solid white',
            backgroundColor: '#004a9e',
            color: '#fff',
          },
          '&.Mui-disabled': {
            color: 'rgba(255, 255, 255, 0.3)',
          },
        },
      },
    },
  },
});

export default {offerFormTheme, registerFormTheme};