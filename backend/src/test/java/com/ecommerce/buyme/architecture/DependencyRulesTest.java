package com.ecommerce.buyme.architecture;

import static com.tngtech.archunit.library.dependencies.SlicesRuleDefinition.slices;
import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;

import com.tngtech.archunit.core.importer.ImportOption;
import com.tngtech.archunit.junit.AnalyzeClasses;
import com.tngtech.archunit.junit.ArchTest;
import com.tngtech.archunit.lang.ArchRule;

@AnalyzeClasses(packages = "com.ecommerce.buyme", importOptions = { ImportOption.DoNotIncludeTests.class })
public class DependencyRulesTest {
    @ArchTest
    static final ArchRule corePackagesMustBeFreeOfCycles = slices()
            .matching("com.ecommerce.buyme.(*)..")
            .should().beFreeOfCycles();

    @ArchTest
    static final ArchRule securityAndConfigMustNotDependOnControllers = noClasses()
            .that().resideInAnyPackage("..security..", "..config..")
            .should().dependOnClassesThat().resideInAPackage("..controller..");
}
