import React, { useState } from 'react';
import {
  FluentProvider,
  webLightTheme,
  Text,
  makeStyles,
  tokens,
  Body1,
  Caption1
} from "@fluentui/react-components";
import Header from '../../components/ShopperHeader';
import TopNav from '../../components/ShopperTopNav';
import Footer from '../../components/ShopperFooter';
import { CopilotProvider } from "@fluentui-copilot/react-copilot";
import { useNavigate } from "react-router-dom";
import { Panel, PanelType, DefaultButton } from '@fluentui/react';
import { IDropdownOption, IImageProps, IStackProps, IStackTokens, Stack,   PrimaryButton, Image} from "@fluentui/react";
import CerebralChatWithAudio from '../../components/CerebralChat';
import {
  Card,
  CardFooter,
  CardHeader,
  CardPreview
} from "@fluentui/react-components";

const useStyles = makeStyles({
    main: {
        gap: "36px",
        display: "flex",
        flexDirection: "column",
        flexWrap: "wrap",
      },
      card: {
        display: "flex",
        width: "600px",
        height: "400px",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        flexShrink: "0",
        borderRadius: "4px",
        border: "1px solid TransparentStroke.Rest",
        background: "NeutralBackground1.Rest",
        boxShadow: "0px 2px 4px 0px rgba(0, 0, 0, 0.14), 0px 0px 2px 0px rgba(0, 0, 0, 0.12)",
      },
      cardsmall: {
        display: "flex",
        width: "350px",
        height: "250px",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        flexShrink: "0",
        borderRadius: "4px",
        border: "1px solid TransparentStroke.Rest",
        background: "NeutralBackground1.Rest",
        boxShadow: "0px 2px 4px 0px rgba(0, 0, 0, 0.14), 0px 0px 2px 0px rgba(0, 0, 0, 0.12)",
        marginLeft: '93px',
        marginRight: '16px',
      },
      cardpreviewtext: {
          color: "var(--Text-Primary, #323130)",
          textAlign: "center",
          fontfeaturesettings: "'liga' off, 'clig' off",
          fontfamily: tokens.fontFamilyBase,
          fontsize: tokens.fontSizeHero800,
          fontstyle: "normal",
          fontweight: tokens.fontWeightRegular,
          lineHeight: tokens.lineHeightHero900
      },      
      cardfooter: {
        display: "flex",
        padding: "var(--card-Vertical, 12px) var(--card-Horizontal, 12px)",
        justifyContent: "center",
        alignItems: "flex-start",
        gap: "var(--card-Gap, 12px)",
        flex: "1 0 0",
        alignSelf: "stretch",
      },
      cardfootercontent: {
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: "var(--card-Gap, 12px)",
        flex: "1 0 0",
      },
      cardfootertitlecontenttext: {
        display: "flex",
        paddingBottom: "2px",
        alignItems: "flex-start",
        alignSelf: "stretch",
        color: "NeutralForeground1.Rest",
        fontFamily: "var(--Font-family-Base, 'Segoe UI')",
        fontSize: "var(--Font-size-300, 14px)",
        fontStyle: "normal",
        fontWeight: "600",
        lineHeight: "var(--Line-height-300, 20px)",
      },
      cardfootersubtitlecontenttext: {
        overflow: "hidden",
        color: "NeutralForeground3.Rest",
        textOverflow: "ellipsis",

/* Web/Caption 1 */
        fontFamily: "var(--Font-family-Base, 'Segoe UI')",
        fontSize: "var(--Font-size-200, 12px)",
        fontStyle: "normal",
        fontWeight: "400",
        lineHeight: "var(--Line-height-200, 16px)",
      },
      explorecategories: {
        width: "100%",
        height: "47px",
        flexShrink: 0,
        color: "NeutralForeground1.Rest",
        fontFamily: "var(--Font-family-Base, 'Segoe UI')",
        fontSize: "var(--Font-size-700, 28px)",
        fontStyle: "normal",
        fontWeight: "600",
        lineHeight: "var(--Line-height-700, 36px)",
        textAlign: "left",
        alignSelf: "stretch",
      },
      categories: {
        width: "100%",
        height: "154px",
        marginTop: '26px',
      },
      categorytext: {
        color: '#242424',
        textAlign: 'center',
        alignSelf: 'stretch',
        fontFamily: 'var(--Font-family-Base, "Segoe UI")',
        fontSize: 'var(--Font-size-300, 14px)',
        fontStyle: 'normal',
        fontWeight: 400,
        lineHeight: 'var(--Line-height-300, 20px)',
      },
      explorecategoriessection: {
        marginTop: '26px',
      },
      ordersection: {
        marginTop: '71px',
        marginBottom: '154px',
      }
    });
    const childStackStyles = {
      root: {
        width: '14.28%', // 100% / 7 for equal width
        height: '100%',
        
      },
    };

    const categoryStyles = {
      root: {
        width: '152px',
        height: '100%',
        paddingBottom: '8px',
        paddingLeft: '8px',
        paddingRight: '8px',
        paddingTop: '8px',
      },
    };

    interface CartPanelProps {
      isOpen: boolean;
      onDismiss: () => void;
      onSave: () => void;
    }  
    const Shopper: React.FC<CartPanelProps> = ({ isOpen, onDismiss, onSave }) => {
        const styles = useStyles();
        const [isDrawerOpen, setIsDrawerOpen] = useState(false);        
        const toggleDrawer = () => {
            setIsDrawerOpen(!isDrawerOpen);
          };
        const navigate = useNavigate();
        const productsNavigation = () => {
          navigate('/shopperproducts');
        }
        const onRenderFooterContent = React.useCallback(
        () => (
            <Stack horizontal tokens={{ childrenGap: 10 }}>
            <PrimaryButton onClick={onSave}>Save</PrimaryButton>
            <DefaultButton onClick={onDismiss}>Cancel</DefaultButton>
            </Stack>
        ),
        [onSave, onDismiss]
        );          
        const [isCerebralDrawerOpen, setIsCerebralDrawerOpen] = useState(false);
        const toggleCerebralDrawer = () => {
          setIsCerebralDrawerOpen(!isCerebralDrawerOpen);
        }; 
        const onRenderCerebralFooterContent = React.useCallback(
          () => (
            <Stack horizontal tokens={{ childrenGap: 10 }}>
              {/* <PrimaryButton onClick={onSaveDrawer}>Save</PrimaryButton> */}
              <DefaultButton onClick={onCancelCerebralDrawer}>Close</DefaultButton>
            </Stack>
          ),
          []
        );
        const onCancelCerebralDrawer = () => {
          setIsCerebralDrawerOpen(false);
        };   
      
          return (
              <FluentProvider theme={webLightTheme}>
                <CopilotProvider mode='sidecar'>
                    <Stack>
                    <Panel
            isOpen={isCerebralDrawerOpen}
            onDismiss={toggleCerebralDrawer}
            type={PanelType.custom}
            customWidth="30%"
            headerText=""
            onRenderFooterContent={onRenderCerebralFooterContent}
            isFooterAtBottom={true}
            hasCloseButton={true}
            closeButtonAriaLabel="Close"
            isLightDismiss={true}            
            >
              <CerebralChatWithAudio />
          </Panel>  

                    <Panel
                        isOpen={isDrawerOpen}
                        onDismiss={toggleDrawer}
                        type={PanelType.custom}
                        customWidth="25%"
                        headerText="Add camera"
                        onRenderFooterContent={onRenderFooterContent}
                        isFooterAtBottom={true}
                    >
                        <Stack>
                            <Stack.Item>
                            </Stack.Item>
                            <Stack.Item>
                            </Stack.Item>
                            <Stack.Item>
                            </Stack.Item>
                            <Stack.Item>
                            </Stack.Item>
                            <Stack.Item>
                            </Stack.Item>
                            <Stack.Item>
                            </Stack.Item>
                        </Stack>
                        </Panel>                          
                        <Header 
                          callParentFunction={toggleDrawer}
                          callCerebralParentFunction={toggleCerebralDrawer} 
                        />
                        <TopNav />
                        <Stack id='MainContent' style={{alignItems: 'center', marginTop: '21px'}}>
                            <Stack>
                              <Stack id='HeroContent' horizontal>
                             <Card className={styles.card} style={{marginLeft: '0px', marginRight: '46px'}}>
                              <CardHeader
                                  image={        
                                  <img
                                    src={"ShopperHeroImage1.png"}
                                    alt="Fridge Abc 123"
                                  />}
                                  description={<Caption1></Caption1>}
                              />
                              <CardFooter className={styles.cardfooter}>
                              <div className={styles.cardfootercontent}>
                                <Text className={styles.cardfootertitlecontenttext}>Now offering curbside pickup</Text>
                                <Text className={styles.cardfootersubtitlecontenttext}>Start your cart
                                </Text>                        
                              </div>
                            </CardFooter>
                              </Card>
                              <Card className={styles.card}>
                            <CardHeader
                                image={        
                                  <img
                                    src={"ShopperHeroImage2.png"}
                                    alt="Fridge Abc 123"
                                  />}
                                description={<Caption1></Caption1>}
                            />
                            <CardFooter className={styles.cardfooter}>  
                            <div className={styles.cardfootercontent}>
                              <Text className={styles.cardfootertitlecontenttext}>Let Cerebral handle your dinner recipes</Text>
                              <Text className={styles.cardfootersubtitlecontenttext}>Ask Cerebral</Text>                        
                            </div>
                            </CardFooter>
                              </Card>      
                              </Stack>      
                              <Stack style={{width: '100%'}} className={styles.explorecategoriessection}>
                                <Text className={styles.explorecategories}>Explore Categories</Text>
                              </Stack>                                                 
                            </Stack>
                            <Stack horizontal id='ExploreCategories' onClick={productsNavigation}>
                             <Stack horizontal id='Categories' className={styles.categories}>
                                <Stack styles={childStackStyles}>
                                  <img src="Rectangle 34655402.png" alt="Category 1" style={categoryStyles.root} />
                                  <Text className={styles.categorytext}>Vegetables</Text>
                                </Stack>
                                <Stack styles={childStackStyles}>
                                  <img src="Rectangle 34655403.png" alt="Category 1" style={categoryStyles.root} />
                                  <Text className={styles.categorytext}>Seafood</Text>
                                </Stack>   
                                <Stack styles={childStackStyles}>
                                  <img src="Rectangle 34655404.png" alt="Category 1" style={categoryStyles.root} />
                                  <Text className={styles.categorytext}>Subs and wraps</Text>
                                </Stack>  
                                <Stack styles={childStackStyles}>
                                  <img src="Rectangle 34655405.png" alt="Category 1" style={categoryStyles.root} />
                                  <Text className={styles.categorytext}>Imported Cheese</Text>
                                </Stack>  
                                <Stack styles={childStackStyles}>
                                  <img src="Rectangle 34655406.png" alt="Category 1" style={categoryStyles.root} />
                                  <Text className={styles.categorytext}>Natural wine</Text>
                                </Stack>  
                                <Stack styles={childStackStyles}>
                                  <img src="Rectangle 34655407.png" alt="Category 1" style={categoryStyles.root} />
                                  <Text className={styles.categorytext}>Gluten-free</Text>
                                </Stack>  
                                <Stack styles={childStackStyles}>
                                  <img src="Rectangle 34655408.png" alt="Category 1" style={categoryStyles.root} />
                                  <Text className={styles.categorytext}>Plant based</Text>
                                </Stack>                                                                                                                                                                                               
                              </Stack>
                            <Stack id='CardsSection' horizontal>

                            </Stack>
                            </Stack>
                            <Stack>
                              <Stack horizontal id='OrderSection' className={styles.ordersection}>
                             <Card className={styles.cardsmall}>
                              <CardHeader
                                  image={        
                                  <img
                                    src={"EasyToCookMealKits.png"}
                                    alt="Fridge Abc 123"
                                  />}
                                  description={<Caption1></Caption1>}
                              />
                              <CardFooter className={styles.cardfooter}>
                              <div className={styles.cardfootercontent}>
                                <Text className={styles.cardfootertitlecontenttext}>Easy to cook meal kits</Text>
                                <Text className={styles.cardfootersubtitlecontenttext}>Located in the deli</Text>                        
                              </div>
                            </CardFooter>
                              </Card>
                              <Card className={styles.cardsmall}>
                            <CardHeader
                                image={        
                                  <img
                                    src={"GrabAndGoMeals.png"}
                                    alt="Fridge Abc 123"
                                  />}
                                description={<Caption1></Caption1>}
                            />
                            <CardFooter className={styles.cardfooter}>  
                            <div className={styles.cardfootercontent}>
                              <Text className={styles.cardfootertitlecontenttext}>Grab and go meals</Text>
                              <Text className={styles.cardfootersubtitlecontenttext}>Located in the deli</Text>                        
                            </div>
                            </CardFooter>
                              </Card>      
                              <Card className={styles.cardsmall}>
                            <CardHeader
                                image={        
                                  <img
                                    src={"CakeForAnyOccasion.png"}
                                    alt="Fridge Abc 123"
                                  />}
                                description={<Caption1></Caption1>}
                            />
                            <CardFooter className={styles.cardfooter}>  
                            <div className={styles.cardfootercontent}>
                              <Text className={styles.cardfootertitlecontenttext}>Cake for any occasion</Text>
                              <Text className={styles.cardfootersubtitlecontenttext}>Located in the deli</Text>                        
                            </div>
                            </CardFooter>
                              </Card>      
                              </Stack>      
                              <Stack style={{width: '100%'}}>
                                <Text className={styles.explorecategories}>Explore Categories</Text>
                              </Stack>                                                 
                            </Stack>
                            <Footer />
                        </Stack>
                    </Stack>
                </CopilotProvider>
              </FluentProvider>
    );
  };
  
  export default Shopper;                
      