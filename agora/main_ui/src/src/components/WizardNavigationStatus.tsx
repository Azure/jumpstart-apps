import { Stack } from "@fluentui/react";
import {
    makeStyles,
    Body1,
    Caption1,
    Button,
  } from "@fluentui/react-components";
import { ArrowReplyRegular, ShareRegular } from "@fluentui/react-icons";  
import SingleContainerBox from "../components/SingleContainerBox";
import DoubleContainerBox from "../components/DoubleContainerBox";
import {
    Card,
    CardFooter,
    CardHeader,
    CardPreview,
    Text,
  } from "@fluentui/react-components";

const useStyles = makeStyles({
    card: {
      margin: "auto",
      width: "350px",
      maxWidth: "100%",
      paddingLeft: "40px"
    },
    stack: {
        margin: "10px",
        gap: "10px"
      },    
    wizardContainer: {        
        width: '200px',
        marginTop: '50px',
        marginRight: '10px',
    },
    wizardContentContainer: {
      },     
    wizardContent: {
        color: '#242424',

        /* Web/Body 1 Strong */
        fontFamily: 'Segoe UI',
        fontSize: '14px',
        fontStyle: 'normal',
        fontWeight: '600',
        lineHeight: '20px', /* 142.857% */
        marginLeft: '20px'
    },
    checkedIcon: {

    },
    uncheckedIcon: {
        
    },
    divider: {

    }

  });

const WizardNavigationStatus = ({activeIndex = 1}) => {
    const styles = useStyles();
    return (

        <Stack id='mainOuterContainer'>
            <Stack id='UploadFileContainer' className={styles.wizardContainer}>
                <Stack horizontal className={styles.wizardContentContainer}>
                    <Stack id='Icon' className={styles.checkedIcon}>
                    { (activeIndex == 1) ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2Z" fill="#5C2E91"/>
                        </svg>
                    ) : (
                        (activeIndex > 1) ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <path d="M10 2C14.4183 2 18 5.58172 18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2ZM13.3584 7.64645C13.1849 7.47288 12.9154 7.4536 12.7206 7.58859L12.6513 7.64645L9 11.298L7.35355 9.65131L7.28431 9.59346C7.08944 9.45846 6.82001 9.47775 6.64645 9.65131C6.47288 9.82488 6.4536 10.0943 6.58859 10.2892L6.64645 10.3584L8.64645 12.3584L8.71569 12.4163C8.8862 12.5344 9.1138 12.5344 9.28431 12.4163L9.35355 12.3584L13.3584 8.35355L13.4163 8.28431C13.5513 8.08944 13.532 7.82001 13.3584 7.64645Z" fill="#5C2E91"/>
                            </svg>              

                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <path d="M10 3C6.13401 3 3 6.13401 3 10C3 13.866 6.13401 17 10 17C13.866 17 17 13.866 17 10C17 6.13401 13.866 3 10 3ZM2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10Z" fill="#5C2E91"/>
                            </svg>                
                        )             
                    )}                    
                    </Stack>
                    <Stack className={styles.wizardContent}>
                        Upload file
                    </Stack>
                </Stack>
            </Stack>
            <Stack id='UploadFileDivider' className={styles.divider}>
            { (activeIndex == 1) ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="36" viewBox="0 0 20 36" fill="none">
                        <path d="M8.75 0.625C8.75 0.279822 9.02982 0 9.375 0C9.72018 0 10 0.279822 10 0.625V35.375C10 35.7202 9.72018 36 9.375 36C9.02982 36 8.75 35.7202 8.75 35.375V0.625Z" fill="#5C2E91"/>
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="24" viewBox="0 0 20 24" fill="none">
                        <path d="M8.75 0.625C8.75 0.279823 9.02982 0 9.375 0C9.72018 0 10 0.279822 10 0.625V23.375C10 23.7202 9.72018 24 9.375 24C9.02982 24 8.75 23.7202 8.75 23.375V0.625Z" fill="#5C2E91"/>
                    </svg>
                )}            </Stack>
            <Stack id='DrawZonesContainer'>
                <Stack horizontal className={styles.wizardContentContainer}>
                    <Stack id='Icon' className={styles.checkedIcon}>
                    { (activeIndex == 2) ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2Z" fill="#5C2E91"/>
                        </svg>
                    ) : (
                        (activeIndex > 2) ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <path d="M10 2C14.4183 2 18 5.58172 18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2ZM13.3584 7.64645C13.1849 7.47288 12.9154 7.4536 12.7206 7.58859L12.6513 7.64645L9 11.298L7.35355 9.65131L7.28431 9.59346C7.08944 9.45846 6.82001 9.47775 6.64645 9.65131C6.47288 9.82488 6.4536 10.0943 6.58859 10.2892L6.64645 10.3584L8.64645 12.3584L8.71569 12.4163C8.8862 12.5344 9.1138 12.5344 9.28431 12.4163L9.35355 12.3584L13.3584 8.35355L13.4163 8.28431C13.5513 8.08944 13.532 7.82001 13.3584 7.64645Z" fill="#5C2E91"/>
                            </svg>              

                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <path d="M10 3C6.13401 3 3 6.13401 3 10C3 13.866 6.13401 17 10 17C13.866 17 17 13.866 17 10C17 6.13401 13.866 3 10 3ZM2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10Z" fill="#5C2E91"/>
                            </svg>                
                        )
                        
                    )} 
                    </Stack>
                    <Stack className={styles.wizardContent}>
                        DrawZones
                    </Stack>
                </Stack>
            </Stack>
            <Stack id='DrawZonesDivider' className={styles.divider}>
            { (activeIndex == 2) ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="36" viewBox="0 0 20 36" fill="none">
                        <path d="M8.75 0.625C8.75 0.279822 9.02982 0 9.375 0C9.72018 0 10 0.279822 10 0.625V35.375C10 35.7202 9.72018 36 9.375 36C9.02982 36 8.75 35.7202 8.75 35.375V0.625Z" fill="#5C2E91"/>
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="24" viewBox="0 0 20 24" fill="none">
                        <path d="M8.75 0.625C8.75 0.279823 9.02982 0 9.375 0C9.72018 0 10 0.279822 10 0.625V23.375C10 23.7202 9.72018 24 9.375 24C9.02982 24 8.75 23.7202 8.75 23.375V0.625Z" fill="#5C2E91"/>
                    </svg>
                )}
            </Stack>
            <Stack id='AssignCamerasContainer'>
                <Stack horizontal className={styles.wizardContentContainer}>
                    <Stack id='Icon' className={styles.checkedIcon}>
                    { (activeIndex == 2) ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2Z" fill="#5C2E91"/>
                        </svg>
                    ) : (
                        (activeIndex > 2) ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <path d="M10 2C14.4183 2 18 5.58172 18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2ZM13.3584 7.64645C13.1849 7.47288 12.9154 7.4536 12.7206 7.58859L12.6513 7.64645L9 11.298L7.35355 9.65131L7.28431 9.59346C7.08944 9.45846 6.82001 9.47775 6.64645 9.65131C6.47288 9.82488 6.4536 10.0943 6.58859 10.2892L6.64645 10.3584L8.64645 12.3584L8.71569 12.4163C8.8862 12.5344 9.1138 12.5344 9.28431 12.4163L9.35355 12.3584L13.3584 8.35355L13.4163 8.28431C13.5513 8.08944 13.532 7.82001 13.3584 7.64645Z" fill="#5C2E91"/>
                            </svg>              

                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <path d="M10 3C6.13401 3 3 6.13401 3 10C3 13.866 6.13401 17 10 17C13.866 17 17 13.866 17 10C17 6.13401 13.866 3 10 3ZM2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10Z" fill="#5C2E91"/>
                            </svg>                
                        )                
                    )}                     
                    </Stack>
                    <Stack className={styles.wizardContent}>
                        Assign cameras
                    </Stack>
                </Stack>
            </Stack>
            <Stack id='AssignCamerasDivider' className={styles.divider}>
            { (activeIndex == 3) ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="36" viewBox="0 0 20 36" fill="none">
                        <path d="M8.75 0.625C8.75 0.279822 9.02982 0 9.375 0C9.72018 0 10 0.279822 10 0.625V35.375C10 35.7202 9.72018 36 9.375 36C9.02982 36 8.75 35.7202 8.75 35.375V0.625Z" fill="#5C2E91"/>
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="24" viewBox="0 0 20 24" fill="none">
                        <path d="M8.75 0.625C8.75 0.279823 9.02982 0 9.375 0C9.72018 0 10 0.279822 10 0.625V23.375C10 23.7202 9.72018 24 9.375 24C9.02982 24 8.75 23.7202 8.75 23.375V0.625Z" fill="#5C2E91"/>
                    </svg>
                )}
            </Stack>
            <Stack id='SetupRegionsContainer'>
                <Stack horizontal className={styles.wizardContentContainer}>
                    <Stack id='Icon' className={styles.checkedIcon}>
                    { (activeIndex == 3) ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2Z" fill="#5C2E91"/>
                        </svg>
                    ) : (
                        (activeIndex > 3) ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <path d="M10 2C14.4183 2 18 5.58172 18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2ZM13.3584 7.64645C13.1849 7.47288 12.9154 7.4536 12.7206 7.58859L12.6513 7.64645L9 11.298L7.35355 9.65131L7.28431 9.59346C7.08944 9.45846 6.82001 9.47775 6.64645 9.65131C6.47288 9.82488 6.4536 10.0943 6.58859 10.2892L6.64645 10.3584L8.64645 12.3584L8.71569 12.4163C8.8862 12.5344 9.1138 12.5344 9.28431 12.4163L9.35355 12.3584L13.3584 8.35355L13.4163 8.28431C13.5513 8.08944 13.532 7.82001 13.3584 7.64645Z" fill="#5C2E91"/>
                            </svg>              

                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <path d="M10 3C6.13401 3 3 6.13401 3 10C3 13.866 6.13401 17 10 17C13.866 17 17 13.866 17 10C17 6.13401 13.866 3 10 3ZM2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10Z" fill="#5C2E91"/>
                            </svg>                
                        )                
                    )} 
                    </Stack>
                    <Stack className={styles.wizardContent}>
                        Setup regions (Optional)
                    </Stack>
                </Stack>
            </Stack>
            <Stack id='SetupRegionsDivider' className={styles.divider}>
                { (activeIndex == 4) ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="36" viewBox="0 0 20 36" fill="none">
                        <path d="M8.75 0.625C8.75 0.279822 9.02982 0 9.375 0C9.72018 0 10 0.279822 10 0.625V35.375C10 35.7202 9.72018 36 9.375 36C9.02982 36 8.75 35.7202 8.75 35.375V0.625Z" fill="#5C2E91"/>
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="24" viewBox="0 0 20 24" fill="none">
                        <path d="M8.75 0.625C8.75 0.279823 9.02982 0 9.375 0C9.72018 0 10 0.279822 10 0.625V23.375C10 23.7202 9.72018 24 9.375 24C9.02982 24 8.75 23.7202 8.75 23.375V0.625Z" fill="#5C2E91"/>
                    </svg>
                )}                     
            </Stack>
            <Stack id='FinishContainer'>
                <Stack horizontal className={styles.wizardContentContainer}>
                    <Stack id='Icon' className={styles.checkedIcon}>
                    { (activeIndex == 4) ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2Z" fill="#5C2E91"/>
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M10 3C6.13401 3 3 6.13401 3 10C3 13.866 6.13401 17 10 17C13.866 17 17 13.866 17 10C17 6.13401 13.866 3 10 3ZM2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10Z" fill="#5C2E91"/>
                        </svg>                
                    )} 
                    </Stack>
                    <Stack className={styles.wizardContent}>
                    Finish
                    </Stack>
                </Stack>
            </Stack>                                             
        </Stack>
    );
  };
  
  export default WizardNavigationStatus;