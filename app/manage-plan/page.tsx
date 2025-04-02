import MaxWidthWrapper from "@/components/max-width-wrapper"
import SchematicComponent from "@/components/schematic/SchematicComponent"

const ManagePlan = () => {
  return (
    <MaxWidthWrapper className="p-4 sm:p-8">
      <SchematicComponent 
        componentId={process.env.NEXT_PUBLIC_SCHEMATIC_CUSTOMER_PORTAL_COMPONENT_ID}
      />
    </MaxWidthWrapper>
      
    
  )
}

export default ManagePlan