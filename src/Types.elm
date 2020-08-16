module Types exposing (..)

import Window
import Http
import Time exposing (Time)
import Html exposing (Html)

import Material
import Material.Color exposing (Color)

type alias Pages =
  { home : HomeModel
  , techSupport : TechSupportModel
  , schedule : ScheduleModel
  , order : OrderModel
  }

type alias HomeModel =
  { banner : Int }

type alias TechSupportModel =
  { option : String
  , toggleFormatWithBackup : Bool
  , toggleStartupProblem : Int
  , toggleBackupOption : Int
  , urgency : Bool
  }

type alias ScheduleModel =
  { order : Order
  , scheduling : List DayScheduling
  , scheduleLoading : Bool
  , scheduleLoadError : Bool
  , place : Int
  , name : String
  , phone : String
  , address : String
  , obs : String
  , day : DayScheduling
  , time : Int
  , resultLoading : Bool
  , result : RequestResult
  }

type alias OrderModel =
  { loadingOrder : Bool
  , id : String
  , result : OrderResult
  }

type alias SendOrder =
  { option : String
  , urgency : Bool
  , withBackup : Bool
  , problem : Int
  , backupOption : Int
  , name : String
  , phone : String
  , obs : String
  , place : String
  , address : String
  , year : Int
  , month : Int
  , monthday : Int
  , hour : Int
  }

type alias RequestResult =
  { status : String
  , order : String
  }

type alias OrderResult =
  { status : String
  , order : OrderItem
  }

type alias OrderItem =
  { id : String
  , status : String
  , option : String
  , urgency : Bool
  , withBackup : Bool
  , problem : Int
  , backupOption : Int
  , name : String
  , phone : String
  , obs : String
  , place : String
  , address : String
  , price : Int
  , delivery : Int
  , date : OrderItemDate
  }

type alias OrderItemDate =
  { year : Int
  , month : Int
  , weekday : Int
  , monthday : Int
  , hour : Int
  }

type alias Model =
  { mdl : Material.Model
  , viewport : Viewport
  , currentPage : Page
  , pages : Pages
  }

type alias Mdl =
  Material.Model

type alias DayScheduling =
  { hours : List Int
  , monthday : Int
  , weekday : Int
  , month : Int
  , year : Int
  }

type Order
  = DevelopmentOrder
  | LawyerOrder
  | FormatOrder
  | ProgramProblemOrder
  | TrollProgramOrder
  | StartupProblemOrder
  | LostFilesOrder
  | SlowProblemOrder
  | NewProgramOrder
  | BackupOrder
  | VirusOrder
  | HelpOrder

type Page
  = Home
  | TechSupport
  | Order
  | Lawyers
  | Development
  | About
  | Schedule

type Viewport
  = Phone
  | Tablet
  | Desktop

type Msg
  = Mdl (Material.Msg Msg)
  | GoTo Page
  | LinkTo String
  | UpdateViewport Window.Size
  | ClickDrawerItem String
  | ScrollToTop
  | ChangeBannerHomePage Int
  | UpdateBannerHomePage Time
  | SelectOptionTechSupportPage String
  | ToggleFormatBackupTechSupportPage Bool
  | ToggleStartupProblemTechSupportPage Int
  | ToggleUrgencyTechSupportPage
  | ToggleBackupOptionTechSupportPage Int
  | SelectOrderSchedulePage Order
  | TogglePlaceSchedulePage Int
  | UpdateNameSchedulePage String
  | UpdatePhoneSchedulePage String
  | UpdateAddressSchedulePage String
  | UpdateObsSchedulePage String
  | RequestSchedulingSchedulePage (Result Http.Error (List DayScheduling))
  | LoadSchedulingSchedulePage
  | SelectDaySchedulePage DayScheduling
  | SelectTimeSchedulePage Int
  | PostSchedulingSchedulePage (Result Http.Error RequestResult)
  | SendOrderSchedulePage
  | RequestOrderOrderPage (Result Http.Error OrderResult)
  | LoadOrderOrderPage String
  | RestartOrderPage